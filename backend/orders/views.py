from django.db import transaction
from django.utils import timezone
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import (
    Order,
    OrderItem,
    OrderItemAddon,
    OrderTax,
    OrderServiceCharge,
)
from django.contrib.auth import get_user_model
from .serializers import (
    CreateOrderSerializer,
    OrderListSerializer,
)

from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync

User = get_user_model()
# =====================================================
# CALCULATE TOTALS
# =====================================================
def calculate_totals(self):

    subtotal = Decimal("0")

    # =============================================
    # ITEMS + ADDONS
    # =============================================
    for item in self.items.all():

        subtotal += item.total_price

        addon_total = item.addons.aggregate(total=models.Sum("total_price"))[
            "total"
        ] or Decimal("0")

        subtotal += addon_total

    self.subtotal = subtotal

    # =============================================
    # GRAND TOTAL
    # =============================================
    self.grand_total = (
        self.subtotal
        + self.tax_amount
        + self.service_charge_amount
        # - self.discount_amount
        + self.round_off_amount
    )

    if self.grand_total < 0:

        self.grand_total = Decimal("0")

    self.save(
        update_fields=[
            "subtotal",
            "grand_total",
        ]
    )

# =========================================================
# CREATE ORDER
# =========================================================
class CreateOrderView(APIView):

    @transaction.atomic
    def post(self, request, restaurant_id):

        serializer = CreateOrderSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        # =================================================
        # WAITER ASSIGNMENT
        # =================================================
        waiter = None

        # ================================================
        # AUTO ASSIGN IF WAITER LOGGED IN
        # ================================================
        if (
            request.user.role == "waiter"
            and data["order_type"] == "dine_in"
        ):

            waiter = request.user

        # ================================================
        # CASHIER SELECTED WAITER
        # ================================================
        elif (
            data["order_type"] == "dine_in"
            and data.get("waiter_id")
        ):

            waiter = User.objects.filter(
                id=data.get("waiter_id"),
                role="waiter",
                restaurant_id=restaurant_id,
            ).first()

        # =================================================
        # CREATE ORDER
        # =================================================
        order = Order.objects.create(
            restaurant_id=restaurant_id,
            created_by=request.user,
            waiter=waiter,
            order_type=data["order_type"],
            floor_id=data.get("floor_id"),
            area_id=data.get("area_id"),
            table_id=data.get("table_id"),
            guest_count=data.get(
                "guest_count",
                1,
            ),
            notes=data.get("notes"),
            payment_method=data.get("payment_method"),
            discount_amount=data.get("discount_amount", Decimal("0")),
            round_off_amount=data.get("round_off_amount", Decimal("0")),
            status="saved",
            saved_at=timezone.now(),
        )

        # =================================================
        # CREATE ITEMS
        # =================================================
        for item_data in data["items"]:

            order_item = OrderItem.objects.create(
                order=order,
                item_type=item_data["item_type"],
                product_variant_id=item_data.get("product_variant_id"),
                combo_id=item_data.get("combo_id"),
                item_name=item_data["item_name"],
                original_price=item_data["original_price"],
                final_price=item_data["final_price"],
                dynamic_pricing_name=item_data.get("dynamic_pricing_name"),
                quantity=item_data["quantity"],
                notes=item_data.get("notes"),
            )

            # =============================================
            # ADDONS
            # =============================================
            for addon_data in item_data.get(
                "addons",
                [],
            ):

                OrderItemAddon.objects.create(
                    order_item=order_item,
                    addon_id=addon_data["addon_id"],
                    addon_name=addon_data["addon_name"],
                    addon_price=addon_data["addon_price"],
                    quantity=addon_data.get(
                        "quantity",
                        1,
                    ),
                )

        # =================================================
        # CREATE TAXES
        # =================================================
        tax_total = Decimal("0")

        for tax_data in data.get(
            "taxes",
            [],
        ):

            tax = OrderTax.objects.create(
                order=order,
                name=tax_data["name"],
                percentage=tax_data["percentage"],
                amount=tax_data["amount"],
            )

            tax_total += tax.amount

        # =================================================
        # CREATE SERVICE CHARGES
        # =================================================
        service_charge_total = Decimal("0")

        for charge_data in data.get(
            "service_charges",
            [],
        ):

            charge = OrderServiceCharge.objects.create(
                order=order,
                name=charge_data["name"],
                charge_type=charge_data["charge_type"],
                value=charge_data["value"],
                amount=charge_data["amount"],
            )

            service_charge_total += charge.amount

        # =================================================
        # SAVE TOTAL TAXES
        # =================================================
        order.tax_amount = tax_total

        order.service_charge_amount = service_charge_total

        order.save(
            update_fields=[
                "tax_amount",
                "service_charge_amount",
            ]
        )

        # =================================================
        # CALCULATE TOTALS
        # =================================================
        order.calculate_totals()

        # =================================================
        # UPDATE TABLE STATUS
        # =================================================
        if order.table:

            order.table.status = "occupied"
            order.table.assigned_waiter = order.waiter
            order.table.save(
                update_fields=[
                    "status",
                    "assigned_waiter",
                ]
            )

        # =========================================
        # SEND TO KITCHEN
        # =========================================
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"kitchen_{restaurant_id}",
            {
                "type": "send_order_event",
                "data": {
                    "event": "new_order",
                    "order": {
                        "id": order.id,
                        "order_number": (order.order_number),
                        "status": order.status,
                        "order_type": (order.order_type),
                        "table_name": (
                            order.table.table_number if order.table else None
                        ),
                        "floor_name": (order.floor.name if order.floor else None),
                        "area_name": (order.area.name if order.area else None),
                        "notes": (order.notes),
                        "grand_total": str(order.grand_total),
                        "created_at": (order.created_at.strftime("%I:%M %p")),
                    },
                },
            },
        )
        return Response(
            {
                "message": "Order created",
                "order_id": order.id,
                "order_number": (order.order_number),
                "subtotal": order.subtotal,
                "tax_amount": (order.tax_amount),
                "service_charge_amount": (order.service_charge_amount),
                "grand_total": (order.grand_total),
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# ORDER LIST
# ========================================================
class OrderListView(APIView):

    def get(self, request, restaurant_id):
        print("REQUEST USER ->", request.user)
        print("ROLE ->", request.user.role)
        print("USER RESTAURANT ->", request.user.restaurant_id)
        print("PARAM RESTAURANT ->", restaurant_id)
        # ======================================
        # BASE QUERY
        # ======================================
        orders = Order.objects.filter(
            restaurant_id=restaurant_id
        )

        # ======================================
        # WAITER ONLY SEES HIS ORDERS
        # ======================================
        if request.user.role == "waiter":

            orders = orders.filter(
                waiter=request.user
            )

        # ======================================
        # LOAD RELATIONS
        # ======================================
        orders = (
            orders
            .select_related(
                "table",
                "floor",
                "area",
                "waiter",
            )
            .prefetch_related(
                "items",
                "items__addons",
            )
            .order_by("-created_at")
        )

        serializer = OrderListSerializer(
            orders,
            many=True,
        )

        return Response(serializer.data)

# =========================================================
# UPDATE ORDER
# =========================================================
class UpdateOrderView(APIView):

    @transaction.atomic
    def patch(self, request, order_id):

        try:
            order = (
                Order.objects
                .select_related("waiter", "table")
                .prefetch_related(
                    "items",
                    "items__addons",
                    "taxes",
                    "service_charges",
                )
                .get(id=order_id)
            )

        except Order.DoesNotExist:

            return Response(
                {"error": "Order not found"},
                status=404
            )

        # ======================================
        # PREVIOUS STATE
        # ======================================
        previous_status = order.status
        previous_waiter = order.waiter

        serializer = CreateOrderSerializer(
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # ======================================
        # BASIC FIELDS
        # ======================================
        if order.order_type == "dine_in":

            waiter_id = data.get("waiter_id")

            if waiter_id:

                order.waiter = User.objects.filter(
                    id=waiter_id,
                    role="waiter",
                    restaurant_id=order.restaurant_id,
                ).first()

        order.status = data.get(
            "status",
            order.status,
        )

        order.payment_status = data.get(
            "payment_status",
            order.payment_status,
        )

        order.notes = data.get(
            "notes",
            order.notes,
        )

        order.payment_method = data.get(
            "payment_method",
            order.payment_method,
        )

        order.discount_amount = data.get(
            "discount_amount",
            order.discount_amount,
        )

        order.tax_amount = data.get(
            "tax_amount",
            order.tax_amount,
        )

        order.service_charge_amount = data.get(
            "service_charge_amount",
            order.service_charge_amount,
        )

        order.save()

        # ======================================
        # UPDATE ITEMS
        # ======================================
        incoming_items = data.get("items", [])

        existing_item_ids = []

        for item_data in incoming_items:

            item_id = item_data.get("id")

            # ==================================
            # UPDATE EXISTING ITEM
            # ==================================
            if item_id:

                try:

                    order_item = OrderItem.objects.get(
                        id=item_id,
                        order=order,
                    )

                except OrderItem.DoesNotExist:
                    continue

                order_item.quantity = item_data.get(
                    "quantity",
                    order_item.quantity,
                )

                order_item.notes = item_data.get(
                    "notes",
                    order_item.notes,
                )

                order_item.final_price = item_data.get(
                    "final_price",
                    order_item.final_price,
                )

                order_item.total_price = (
                    Decimal(str(order_item.final_price))
                    * Decimal(str(order_item.quantity))
                )

                order_item.save()

            # ==================================
            # CREATE NEW ITEM
            # ==================================
            else:

                order_item = OrderItem.objects.create(
                    order=order,
                    item_type=item_data["item_type"],
                    product_variant_id=item_data.get("product_variant_id"),
                    combo_id=item_data.get("combo_id"),
                    item_name=item_data["item_name"],
                    original_price=item_data["original_price"],
                    final_price=item_data["final_price"],
                    quantity=item_data["quantity"],
                    notes=item_data.get("notes"),
                    dynamic_pricing_name=item_data.get(
                        "dynamic_pricing_name"
                    ),
                    total_price=(
                        Decimal(str(item_data["final_price"]))
                        * Decimal(str(item_data["quantity"]))
                    ),
                )

            existing_item_ids.append(order_item.id)

            # ==================================
            # UPDATE ADDONS
            # ==================================
            incoming_addons = item_data.get(
                "addons",
                []
            )

            existing_addon_ids = []

            for addon_data in incoming_addons:

                addon_id = addon_data.get("id")

                # ==============================
                # UPDATE EXISTING ADDON
                # ==============================
                if addon_id:

                    try:

                        addon = OrderItemAddon.objects.get(
                            id=addon_id,
                            order_item=order_item,
                        )

                    except OrderItemAddon.DoesNotExist:
                        continue

                    addon.quantity = addon_data.get(
                        "quantity",
                        addon.quantity,
                    )

                    addon.total_price = (
                        Decimal(str(addon.addon_price))
                        * Decimal(str(addon.quantity))
                    )

                    addon.save()

                # ==============================
                # CREATE NEW ADDON
                # ==============================
                else:

                    addon = OrderItemAddon.objects.create(
                        order_item=order_item,
                        addon_id=addon_data["addon_id"],
                        addon_name=addon_data["addon_name"],
                        addon_price=addon_data["addon_price"],
                        quantity=addon_data.get(
                            "quantity",
                            1,
                        ),
                        total_price=(
                            Decimal(str(addon_data["addon_price"]))
                            * Decimal(
                                str(
                                    addon_data.get(
                                        "quantity",
                                        1,
                                    )
                                )
                            )
                        ),
                    )

                existing_addon_ids.append(addon.id)

            # ==================================
            # DELETE REMOVED ADDONS
            # ==================================
            order_item.addons.exclude(
                id__in=existing_addon_ids
            ).delete()

        # ======================================
        # DELETE REMOVED ITEMS
        # ======================================
        order.items.exclude(
            id__in=existing_item_ids
        ).delete()

        # ======================================
        # REFRESH ORDER + CLEAR PREFETCH CACHE
        # ======================================
        if hasattr(order, "_prefetched_objects_cache"):
            order._prefetched_objects_cache = {}

        # ======================================
        # RECALCULATE TOTALS
        # ======================================
        order.calculate_totals()
    
        # ======================================
        # TABLE LOGIC
        # ======================================
        if order.table:

            if order.status in [
                "completed",
                "cancelled",
            ]:

                order.table.status = "available"
                order.table.assigned_waiter = None

                order.table.save(
                    update_fields=[
                        "status",
                        "assigned_waiter",
                    ]
                )

            else:

                order.table.status = "occupied"

                order.table.save(
                    update_fields=["status"]
                )
        
        # =====================================

        # order.refresh_from_db()

        order = (
            Order.objects
            .select_related(
                "waiter",
                "table",
                "floor",
                "area",
            )
            .prefetch_related(
                "items",
                "items__addons",
                "taxes",
                "service_charges",
            )
            .get(id=order.id)
        )

        serialized_order = (
            OrderListSerializer(order).data
        )

        # ======================================
        # SOCKET EVENT
        # ======================================
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"kitchen_{order.restaurant.id}",
            {
                "type": "send_order_event",
                "data": {
                    "event": "order_updated",
                    "order": serialized_order,
                },
            },
        )

        # ======================================
        # WAITER READY EVENT
        # ======================================
        if (
            previous_status != "ready"
            and order.status == "ready"
            and previous_waiter is not None
        ):

            async_to_sync(channel_layer.group_send)(
                f"waiter_{previous_waiter.id}",
                {
                    "type": "send_order_event",
                    "data": {
                        "event": "order_ready",
                        "order": serialized_order,
                    },
                },
            )

        return Response({
            "message": "Order updated successfully",
            "order": serialized_order,
        })

# =========================================================
# DELETE ORDER
# =========================================================
class DeleteOrderView(APIView):

    @transaction.atomic
    def delete(self, request, order_id):

        try:

            order = Order.objects.select_related(
                "restaurant",
                "table",
                "floor",
                "area",
            ).get(id=order_id)

        except Order.DoesNotExist:

            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        restaurant_id = order.restaurant.id

        order_number = order.order_number

        # =============================================
        # FREE TABLE
        # =============================================
        if order.table:

            order.table.status = "available"

            # REMOVE WAITER
            order.table.assigned_waiter = None

            order.table.save(
                update_fields=[
                    "status",
                    "assigned_waiter",
                ]
            )

            order.table.save()

        # REMOVE WAITER FROM ORDER
        order.waiter = None
        # =============================================
        # DELETE ORDER
        # =============================================
        order.delete()

        # =============================================
        # SEND SOCKET EVENT
        # =============================================
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"kitchen_{restaurant_id}",
            {
                "type": "send_order_event",
                "data": {
                    "event": "order_deleted",
                    "order": {
                        "order_number": (order_number),
                    },
                },
            },
        )

        return Response(
            {"message": "Order deleted successfully"},
            status=status.HTTP_200_OK,
        )
