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
    OrderItemTax,
    OrderComboItem,
    OrderComboItemTax,
    OrderAddonTax,
)
from django.contrib.auth import get_user_model
from .serializers import (
    CreateOrderSerializer,
    OrderListSerializer,
)

from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync
from menu.models import ServiceCharge, Combo, ProductVariant, Addon
from menu.utils.pricing import (
    calculate_product_price,
    calculate_combo_price,
    calculate_product_taxes,
)
from orders.utils.pricing import calculate_order_totals

User = get_user_model()


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
        # WAITER
        # =================================================
        waiter = None

        if request.user.role == "waiter" and data["order_type"] == "dine_in":

            waiter = request.user

        elif data["order_type"] == "dine_in" and data.get("waiter_id"):

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
            customer=(request.user if request.user.role == "customer" else None),
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
            discount_amount=data.get(
                "discount_amount",
                Decimal("0"),
            ),
            round_off_amount=data.get(
                "round_off_amount",
                Decimal("0"),
            ),
            status="saved",
            saved_at=timezone.now(),
        )

        # =================================================
        # PREPARED ITEMS
        # =================================================
        prepared_items = []

        # =================================================
        # CREATE ITEMS
        # =================================================
        for item_data in data["items"]:

            quantity = Decimal(str(item_data["quantity"]))

            product_id = None
            prepared_combo_items = []
            # =============================================
            # PRODUCT
            # =============================================
            if item_data["item_type"] == "product":

                product_variant = ProductVariant.objects.select_related("product").get(
                    id=item_data["product_variant_id"]
                )

                product = product_variant.product

                item_name = f"{product.name} " f"({product_variant.name})"

                pricing_data = calculate_product_price(product_variant)

                original_price = pricing_data["original_price"]

                final_price = pricing_data["final_price"]

                dynamic_pricing_name = pricing_data.get("dynamic_pricing_name")

                product_id = product.id
            # =============================================
            # COMBO
            # =============================================
            elif item_data["item_type"] == "combo":

                combo = Combo.objects.get(id=item_data["combo_id"])

                item_name = combo.name

                pricing_data = calculate_combo_price(combo)

                original_price = pricing_data["original_price"]

                final_price = pricing_data["final_price"]

                dynamic_pricing_name = pricing_data.get("dynamic_pricing_name")

                combo_recipes = list(
                    combo.recipes.select_related(
                        "product_variant",
                        "product_variant__product",
                    )
                )

                total_original_price = Decimal("0")

                for recipe in combo_recipes:

                    total_original_price += (
                        recipe.product_variant.price * recipe.quantity
                    )

                if total_original_price <= 0:

                    total_original_price = Decimal("1")

                prepared_combo_items = []

                combo_snapshot_items = []

                for recipe in combo_recipes:

                    variant = recipe.product_variant

                    product = variant.product

                    total_combo_items = len(combo_recipes)

                    item_original_total = (
                        variant.price * recipe.quantity
                    )

                    allocated_price = (
                        item_original_total
                        / total_original_price
                    ) * original_price
                    allocated_price = allocated_price.quantize(
                        Decimal("0.01")
                    )
                    allocated_price = round(
                        allocated_price,
                        2,
                    )
                    tax_data = calculate_product_taxes(
                        product=product,
                        taxable_amount=(
                            allocated_price * quantity
                        ),
                    )
                    combo_snapshot_items.append(
                        {
                            "product_name": product.name,
                            "variant_name": variant.name,
                            "quantity": recipe.quantity,
                            "allocated_price": allocated_price,
                            "product": product,
                            "taxes": tax_data["taxes"],
                        }
                    )
                  
                    prepared_combo_items.append(
                        {
                            "product_id": product.id,
                            "quantity": recipe.quantity,
                            "allocated_price": allocated_price,
                            "taxes": tax_data["taxes"],
                        }
                    )
            else:

                return Response(
                    {
                        "error": (
                            f"Invalid item_type: "
                            f"{item_data.get('item_type')}"
                        )
                    },
                    status=400,
                )
            # =============================================
            # CREATE ITEM
            # =============================================
            order_item = OrderItem.objects.create(
                order=order,
                item_type=item_data["item_type"],
                product_variant_id=item_data.get("product_variant_id"),
                combo_id=item_data.get("combo_id"),
                item_name=item_name,
                original_price=original_price,
                final_price=final_price,
                dynamic_pricing_name=dynamic_pricing_name,
                quantity=quantity,
                total_price=(final_price * quantity),
                notes=item_data.get("notes"),
            )

            if item_data["item_type"] == "product":

                tax_data = calculate_product_taxes(
                    product=product_variant.product,
                    taxable_amount=(
                        final_price * quantity
                    ),
                )

                for tax in tax_data["taxes"]:

                    OrderItemTax.objects.create(
                        order_item=order_item,
                        name=tax["name"],
                        percentage=tax["percentage"],
                    )
            if item_data["item_type"] == "combo":

                for combo_item_data in combo_snapshot_items:

                    combo_item = OrderComboItem.objects.create(
                        order_item=order_item,
                        product_name=combo_item_data["product_name"],
                        variant_name=combo_item_data["variant_name"],
                        quantity=combo_item_data["quantity"],
                        allocated_price=combo_item_data["allocated_price"],
                    )

                    for tax in combo_item_data["taxes"]:

                        OrderComboItemTax.objects.create(
                            combo_item=combo_item,
                            name=tax["name"],
                            percentage=tax["percentage"],
                        )
            
            # =============================================
            # ADDONS
            # =============================================
            prepared_addons = []

            for addon_data in item_data.get(
                "addons",
                [],
            ):
                addon = Addon.objects.get(
                    id=addon_data["addon_id"]
                )
                addon_quantity = Decimal(
                    str(
                        addon_data.get(
                            "quantity",
                            1,
                        )
                    )
                )

                addon_price = Decimal(
                        str(addon.price)
                 )

                addon_total = (
                    addon_price
                    * addon_quantity
                )

                created_addon = (
                    OrderItemAddon.objects.create(
                        order_item=order_item,
                        addon_id=addon.id,
                        addon_name=addon.name,
                        addon_price=addon_price,
                        quantity=addon_quantity,
                        total_price=addon_total,
                    )
                )
                # add below when create tax mapping with addon items 
                # =========================================
                # ADDON TAXES
                # =========================================
                # for addon_tax_data in addon_data.get(
                #     "taxes",
                #     [],
                # ):

                #     OrderAddonTax.objects.create(
                #         addon=created_addon,
                #         name=addon_tax_data["name"],
                #         percentage=addon_tax_data[
                #             "percentage"
                #         ],
                #     )

                prepared_addons.append(
                    {
                        "addon_price": addon_price,
                        "quantity": addon_quantity,
                    }
                )

            # =============================================
            # PREPARED ITEM
            # =============================================
            prepared_items.append(
                {
                    "item_type": item_data["item_type"],
                    "product_id": product_id,
                    "combo_items": (
                        prepared_combo_items
                        if item_data["item_type"] == "combo"
                        else []
                    ),
                    "final_price": final_price,
                    "quantity": quantity,
                    "addons": prepared_addons,
                }
            )

        print("\n================ PREPARED ITEMS ================\n")

        from pprint import pprint

        pprint(prepared_items)

        print("\n================================================\n")
        # =================================================
        # CALCULATE TOTALS
        # =================================================
        totals = calculate_order_totals(
            restaurant_id=restaurant_id,
            order_type=order.order_type,
            items=prepared_items,
            discount_amount=(order.discount_amount),
            round_off_amount=(order.round_off_amount),
        )

        # =================================================
        # SAVE TOTALS
        # =================================================
        order.subtotal = totals["subtotal"]

        order.tax_amount = totals["tax_total"]

        order.service_charge_amount = totals["service_charge_total"]

        order.grand_total = totals["grand_total"]

        order.save(
            update_fields=[
                "subtotal",
                "tax_amount",
                "service_charge_amount",
                "grand_total",
            ]
        )

        # =================================================
        # TAXES
        # =================================================
        for tax in totals["tax_breakdown"]:

            OrderTax.objects.create(
                order=order,
                name=tax["name"],
                percentage=tax["percentage"],
                amount=tax["amount"],
            )

        # =================================================
        # SERVICE CHARGES
        # =================================================
        for charge in totals["service_charge_breakdown"]:

            OrderServiceCharge.objects.create(
                order=order,
                name=charge["name"],
                charge_type=charge["charge_type"],
                value=charge["value"],
                amount=charge["amount"],
            )

        # =================================================
        # TABLE STATUS
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

        # =================================================
        # RESPONSE
        # =================================================
        return Response(
            {
                "message": "Order created",
                "order_id": order.id,
                "order_number": order.order_number,
                "subtotal": order.subtotal,
                "tax_amount": order.tax_amount,
                "service_charge_amount": order.service_charge_amount,
                "grand_total": order.grand_total,
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
        orders = Order.objects.filter(restaurant_id=restaurant_id)

        # ======================================
        # WAITER ONLY SEES HIS ORDERS
        # ======================================
        if request.user.role == "waiter":

            orders = orders.filter(waiter=request.user)

        # ======================================
        # LOAD RELATIONS
        # ======================================
        orders = (
            orders.select_related(
                "table",
                "floor",
                "area",
                "waiter",
            )
            .prefetch_related(
                "items",
                "items__taxes",
                "items__addons",
                "items__addons__taxes",
                "items__combo_items",
                "items__combo_items__taxes",
                "taxes",
                "service_charges",
            )
            .order_by("-created_at")
        )

        serializer = OrderListSerializer(
            orders,
            many=True,
        )
        print("print->", serializer.data)
        return Response(serializer.data)

# =========================================================
# UPDATE ORDER
# =========================================================
class UpdateOrderView(APIView):

    @transaction.atomic
    def patch(self, request, order_id):

        try:

            order = (
                Order.objects.select_related(
                    "waiter",
                    "table",
                )
                .prefetch_related(
                    "items",
                    "items__taxes",
                    "items__addons",
                    "items__addons__taxes",
                    "items__combo_items",
                    "items__combo_items__taxes",
                    "taxes",
                    "service_charges",
                )
                .get(id=order_id)
            )

        except Order.DoesNotExist:

            return Response(
                {"error": "Order not found"},
                status=404,
            )

        # =================================================
        # PREVIOUS STATE
        # =================================================
        previous_status = order.status

        previous_waiter = order.waiter

        serializer = CreateOrderSerializer(
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # =================================================
        # BASIC FIELDS
        # =================================================
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

        order.round_off_amount = data.get(
            "round_off_amount",
            order.round_off_amount,
        )

        order.save()

        # =================================================
        # UPDATE ITEMS
        # =================================================
        incoming_items = data.get("items", [])

        existing_item_ids = []

        for item_data in incoming_items:

            item_id = item_data.get("id")

            quantity = Decimal(str(item_data["quantity"]))

            # =============================================
            # PRODUCT
            # =============================================
            item_type = item_data.get("item_type")

            if item_type == "product":

                product_variant = ProductVariant.objects.select_related("product").get(
                    id=item_data["product_variant_id"]
                )

                pricing_data = calculate_product_price(product_variant)

                original_price = pricing_data["original_price"]

                final_price = pricing_data["final_price"]

                dynamic_pricing_name = pricing_data["dynamic_pricing_name"]

                item_name = (
                    f"{product_variant.product.name} " f"({product_variant.name})"
                )

            # =============================================
            # COMBO
            # =============================================
            else:

                combo = Combo.objects.get(id=item_data["combo_id"])

                pricing_data = calculate_combo_price(combo)

                original_price = pricing_data["original_price"]

                final_price = pricing_data["final_price"]

                dynamic_pricing_name = pricing_data["dynamic_pricing_name"]

                item_name = combo.name

            # =============================================
            # ITEM TOTAL
            # =============================================
            item_total = Decimal(str(final_price)) * quantity

            # =============================================
            # UPDATE EXISTING ITEM
            # =============================================
            if item_id:

                try:

                    order_item = OrderItem.objects.get(
                        id=item_id,
                        order=order,
                    )

                except OrderItem.DoesNotExist:

                    continue

                order_item.item_name = item_name
                order_item.original_price = original_price
                order_item.final_price = final_price
                order_item.dynamic_pricing_name = dynamic_pricing_name
                order_item.quantity = quantity
                order_item.notes = item_data.get("notes")
                order_item.total_price = item_total

                order_item.save()

            # =============================================
            # CREATE NEW ITEM
            # =============================================
            else:

                order_item = OrderItem.objects.create(
                    order=order,
                    item_type=item_data["item_type"],
                    product_variant_id=item_data.get("product_variant_id"),
                    combo_id=item_data.get("combo_id"),
                    item_name=item_name,
                    original_price=original_price,
                    final_price=final_price,
                    dynamic_pricing_name=(dynamic_pricing_name),
                    quantity=quantity,
                    total_price=item_total,
                    notes=item_data.get("notes"),
                )

            existing_item_ids.append(order_item.id)

            # =================================================
            # UPDATE ADDONS
            # =================================================
            incoming_addons = item_data.get(
                "addons",
                [],
            )

            existing_addon_ids = []

            for addon_data in incoming_addons:

                addon_row_id = addon_data.get("id")

                addon_total = Decimal(str(addon_data["addon_price"])) * Decimal(
                    str(
                        addon_data.get(
                            "quantity",
                            1,
                        )
                    )
                )

                # =============================================
                # UPDATE EXISTING ADDON
                # =============================================
                if addon_row_id:

                    try:

                        addon = OrderItemAddon.objects.get(
                            id=addon_row_id,
                            order_item=order_item,
                        )

                    except OrderItemAddon.DoesNotExist:

                        continue

                    addon.quantity = addon_data.get(
                        "quantity",
                        1,
                    )

                    addon.total_price = addon_total

                    addon.save()

                # =============================================
                # CREATE NEW ADDON
                # =============================================
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
                        total_price=addon_total,
                    )

                existing_addon_ids.append(addon.id)

            # =================================================
            # DELETE REMOVED ADDONS
            # =================================================
            order_item.addons.exclude(id__in=existing_addon_ids).delete()

        # =================================================
        # DELETE REMOVED ITEMS
        # =================================================
        order.items.exclude(id__in=existing_item_ids).delete()

        # =================================================
        # CLEAR OLD TAXES
        # =================================================
        order.taxes.all().delete()

        tax_total = Decimal("0")

        # =================================================
        # RECALCULATE TAXES
        # =================================================
        for item in order.items.all():

            if item.item_type != "product":

                continue

            product_variant = ProductVariant.objects.select_related("product").get(
                id=item.product_variant_id
            )

            taxable_amount = item.total_price

            addon_total = item.addons.aggregate(total=models.Sum("total_price"))[
                "total"
            ] or Decimal("0")

            taxable_amount += addon_total

            taxes_data = calculate_product_taxes(
                product_variant.product,
                taxable_amount,
            )

            for tax_data in taxes_data["taxes"]:

                OrderTax.objects.create(
                    order=order,
                    name=tax_data["name"],
                    percentage=tax_data["percentage"],
                    amount=tax_data["amount"],
                )

            tax_total += taxes_data["total_tax"]

        # =================================================
        # CLEAR OLD SERVICE CHARGES
        # =================================================
        order.service_charges.all().delete()

        # =================================================
        # RECALCULATE SUBTOTAL
        # =================================================
        subtotal = Decimal("0")

        for item in order.items.all():

            subtotal += item.total_price

            addon_total = item.addons.aggregate(total=models.Sum("total_price"))[
                "total"
            ] or Decimal("0")

            subtotal += addon_total

        # =================================================
        # RECALCULATE SERVICE CHARGES
        # =================================================
        service_charge_total = Decimal("0")

        service_charges = ServiceCharge.objects.filter(
            restaurant_id=order.restaurant_id,
            is_active=True,
            applicable_order_types__contains=[order.order_type],
        )

        for service_charge in service_charges:

            if service_charge.charge_type == "percentage":

                amount = subtotal * Decimal(str(service_charge.value)) / Decimal("100")

            else:

                amount = Decimal(str(service_charge.value))

            OrderServiceCharge.objects.create(
                order=order,
                name=service_charge.name,
                charge_type=(service_charge.charge_type),
                value=service_charge.value,
                amount=amount,
            )

            service_charge_total += amount

        # =================================================
        # SAVE TOTALS
        # =================================================
        order.subtotal = subtotal

        order.tax_amount = tax_total

        order.service_charge_amount = service_charge_total

        order.grand_total = (
            subtotal
            + tax_total
            + service_charge_total
            - order.discount_amount
            + order.round_off_amount
        )

        if order.grand_total < 0:

            order.grand_total = Decimal("0")

        order.save(
            update_fields=[
                "subtotal",
                "tax_amount",
                "service_charge_amount",
                "grand_total",
            ]
        )

        # =================================================
        # TABLE LOGIC
        # =================================================
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

                order.table.save(update_fields=["status"])

        # =================================================
        # REFRESH ORDER
        # =================================================
        order = (
            Order.objects.select_related(
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

        serialized_order = OrderListSerializer(order).data

        # =================================================
        # SOCKET EVENT
        # =================================================
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

        # =================================================
        # WAITER READY EVENT
        # =================================================
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

        return Response(
            {
                "message": "Order updated successfully",
                "order": serialized_order,
            }
        )


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
