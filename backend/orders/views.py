from django.db import transaction
from django.utils import timezone
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from django.shortcuts import get_object_or_404
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
from inventory.services import (deduct_order_inventory)
from audits.services import create_activity_log
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

        initial_status = (
            "pending_approval"
            if request.user.role == "customer"
            else "saved"
        )

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
            status=initial_status,
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

        create_activity_log(
            restaurant=order.restaurant,
            user=request.user,
            order=order,
            action="order_created",
            message=(
                f"{request.user.username} "
                f"created order "
                f"{order.order_number}"
            ),
        )
        # =========================================
        # SEND TO KITCHEN
        # =========================================
        channel_layer = get_channel_layer()
        if order.status != "pending_approval":
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
# =========================================================
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
        # KITCHEN FILTER
        # ======================================
        if (
            request.query_params.get("kitchen")
            == "true"
        ):
            orders = orders.exclude(
                status="pending_approval"
            )

        # ======================================
        # WAITER ONLY SEES HIS ORDERS
        # ======================================
        if request.user.role == "waiter":

            orders = orders.filter(
                waiter=request.user
            )

        # ======================================
        # DELIVERY STAFF
        # ======================================
        elif request.user.role == "delivery":
            delivery_requests = request.query_params.get(
                "delivery_requests"
            )
            delivery_history = request.query_params.get(
                "delivery_history"
            )

            # ======================================
            # AVAILABLE ORDERS TO ACCEPT
            # ======================================
            if delivery_requests == "true":

                orders = orders.filter(
                    order_type="delivery",
                    status="ready",
                    delivery_status="unassigned",
                    delivery_staff__isnull=True,
                )

            # ======================================
            # DELIVERY HISTORY
            # ======================================
            elif delivery_history == "true":

                orders = orders.filter(
                    delivery_staff=request.user,
                    delivery_status="delivered",
                    status="completed",
                )

            # ======================================
            # ACTIVE DELIVERIES
            # ======================================
            else:

                orders = orders.filter(
                    delivery_staff=request.user
                ).exclude(
                    delivery_status="delivered"
                )
        
       
        # ======================================
        # LOAD RELATIONS
        # ======================================
        orders = (
            orders.select_related(
                "table",
                "floor",
                "area",
                "waiter",
                "delivery_staff",
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

        previous_total = order.grand_total

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

                addon_master = Addon.objects.get(
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
                    str(addon_master.price)
                )

                addon_total = (
                    addon_price
                    * addon_quantity
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

                    addon.addon_id = addon_master.id
                    addon.addon_name = addon_master.name
                    addon.addon_price = addon_price
                    addon.quantity = addon_quantity
                    addon.total_price = addon_total

                    addon.save()

                # =============================================
                # CREATE NEW ADDON
                # =============================================
                else:

                    addon = OrderItemAddon.objects.create(
                        order_item=order_item,
                        addon_id=addon_master.id,
                        addon_name=addon_master.name,
                        addon_price=addon_price,
                        quantity=addon_quantity,
                        total_price=addon_total,
                    )

                existing_addon_ids.append(addon.id)

            # =================================================
            # DELETE REMOVED ADDONS
            # =================================================
            order_item.addons.exclude(
                id__in=existing_addon_ids
            ).delete()
            # =================================================
            # DELETE REMOVED ADDONS
            # =================================================
            order_item.addons.exclude(id__in=existing_addon_ids).delete()

        # =================================================
        # DELETE REMOVED ITEMS
        # =================================================
        order.items.exclude(id__in=existing_item_ids).delete()


        # =================================================
        # CLEAR OLD SERVICE CHARGES
        # =================================================
        order.service_charges.all().delete()

        # =================================================
        # CLEAR OLD TAXES / SERVICE CHARGES
        # =================================================
        order.taxes.all().delete()

        order.service_charges.all().delete()

        # =================================================
        # PREPARE ITEMS FOR TOTAL CALCULATION
        # =================================================
        prepared_items = []

        for item in order.items.prefetch_related(
            "addons",
            "combo_items",
            "combo_items__taxes",
        ):

            prepared_addons = []

            for addon in item.addons.all():

                prepared_addons.append(
                    {
                        "addon_price": addon.addon_price,
                        "quantity": addon.quantity,
                    }
                )

            prepared_combo_items = []

            if item.item_type == "combo":

                for combo_item in item.combo_items.all():

                    prepared_combo_items.append(
                        {
                            "quantity": combo_item.quantity,
                            "allocated_price": combo_item.allocated_price,
                            "taxes": [
                                {
                                    "name": tax.name,
                                    "percentage": tax.percentage,
                                }
                                for tax in combo_item.taxes.all()
                            ],
                        }
                    )

            prepared_items.append(
                {
                    "item_type": item.item_type,
                    "product_id": (
                        item.product_variant.product.id
                        if item.item_type == "product"
                        else None
                    ),
                    "final_price": item.final_price,
                    "quantity": item.quantity,
                    "addons": prepared_addons,
                    "combo_items": prepared_combo_items,
                }
            )

        # =================================================
        # RECALCULATE TOTALS
        # =================================================
        totals = calculate_order_totals(
            restaurant_id=order.restaurant_id,
            order_type=order.order_type,
            items=prepared_items,
            discount_amount=order.discount_amount,
            round_off_amount=order.round_off_amount,
        )

        # =================================================
        # SAVE TOTALS
        # =================================================
        order.subtotal = totals["subtotal"]

        order.tax_amount = totals["tax_total"]

        order.service_charge_amount = (
            totals["service_charge_total"]
        )

        order.grand_total = totals["grand_total"]
        new_status = data.get("status")

        if (
            previous_status != "confirmed"
            and new_status == "confirmed"
        ):
            order.confirmed_at = timezone.now()

        if new_status:
            order.status = new_status
        print("ORDER STATUS:", order.status)
        print("PAYMENT STATUS:", order.payment_status)
        print("PAYMENT METHOD:", order.payment_method)
        print("DELIVERY STATUS:", order.delivery_status)
        order.save(
            update_fields=[
                "subtotal",
                "tax_amount",
                "service_charge_amount",
                "grand_total",
                "status",
                "confirmed_at",
            ]
        )

        # ==========================================
        # ORDER UPDATED
        # ==========================================
        create_activity_log(
            restaurant=order.restaurant,
            user=request.user,
            order=order,
            action="order_updated",
            message=(
                f"{request.user.get_full_name() or request.user.email} "
                f"updated order {order.order_number}"
            ),
        )

        if previous_status != order.status:

            action_mapping = {
                "confirmed": "confirmed",
                "preparing": "preparing",
                "ready": "ready",
                "served": "served",
                "completed": "completed",
                "cancelled": "cancelled",
            }

            action = action_mapping.get(
                order.status,
                "status_changed",
            )

            create_activity_log(
                restaurant=order.restaurant,
                user=request.user,
                order=order,
                action=action,
                message=(
                    f"{request.user.get_full_name() or request.user.email} "
                    f"changed order {order.order_number} "
                    f"from {previous_status} to {order.status}"
                ),
            )

            if (
                previous_status == "pending_approval"
                and order.status == "confirmed"
            ):
                create_activity_log(
                    restaurant=order.restaurant,
                    user=request.user,
                    order=order,
                    action="confirmed",
                    message=(
                        f"Customer order {order.order_number} "
                        f"approved by "
                        f"{request.user.get_full_name() or request.user.email}"
                    ),
                )
        
        if previous_waiter != order.waiter:

            create_activity_log(
                restaurant=order.restaurant,
                user=request.user,
                order=order,
                action="waiter_changed",
                message=(
                    f"Waiter changed for order "
                    f"{order.order_number}"
                ),
            )

        if (
            previous_status != "cancelled"
            and order.status == "cancelled"
        ):

            create_activity_log(
                restaurant=order.restaurant,
                user=request.user,
                order=order,
                action="cancelled",
                message=(
                    f"Order {order.order_number} cancelled"
                ),
            )
        # =================================================
        # SAVE TAXES
        # =================================================
        for tax in totals["tax_breakdown"]:

            OrderTax.objects.create(
                order=order,
                name=tax["name"],
                percentage=tax["percentage"],
                amount=tax["amount"],
            )

        # =================================================
        # SAVE SERVICE CHARGES
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
        if (
            order.status != "pending_approval"
        ):
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
        # CREATE AUDIT LOG
        # =============================================
        create_activity_log(
            restaurant=order.restaurant,
            user=request.user,
            order=order,
            action="order_deleted",
            message=(
                f"{request.user.username} "
                f"deleted order "
                f"{order.order_number}"
            ),
        )
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


class UpdateOrderStatusView(APIView):

    def patch(self, request, order_id):

        order = get_object_or_404(
            Order.objects.select_related(
                "waiter",
            ),
            id=order_id,
        )

        previous_status = order.status

        new_status = request.data.get(
            "status",
            order.status,
        )

        update_fields = ["status"]

        # ==========================================
        # SET READY TIME
        # ==========================================
        if (
            previous_status != "ready"
            and new_status == "ready"
            and not order.ready_at
        ):
            order.ready_at = timezone.now()
            update_fields.append("ready_at")

        order.status = new_status

        order.save(update_fields=update_fields)

        if (
            request.user.role != "customer"
            and previous_status != new_status
        ):
            create_activity_log(
                restaurant=order.restaurant,
                user=request.user,
                order=order,
                action=new_status,
                message=(
                    f"{request.user.username} "
                    f"changed order "
                    f"{order.order_number} "
                    f"from "
                    f"{previous_status} "
                    f"to "
                    f"{new_status}"
                ),
            )
        channel_layer = get_channel_layer()

        serialized_order = OrderListSerializer(order).data

        if (
            previous_status != "preparing"
            and order.status == "preparing"
            and not order.inventory_deducted
        ):
            deduct_order_inventory(order)

        # ==========================================
        # ORDER READY
        # ==========================================
        if (
            previous_status != "ready"
            and order.status == "ready"
        ):

            if (
                order.order_type == "dine_in"
                and order.waiter
            ):
                async_to_sync(
                    channel_layer.group_send
                )(
                    f"waiter_{order.waiter.id}",
                    {
                        "type": "send_order_event",
                        "data": {
                            "event": "order_ready",
                            "order": serialized_order,
                        },
                    },
                )

            elif (
                order.order_type == "delivery"
                and order.delivery_status == "unassigned"
            ):
                async_to_sync(
                    channel_layer.group_send
                )(
                    f"delivery_{order.restaurant.id}",
                    {
                        "type": "send_order_event",
                        "data": {
                            "event": "delivery_request",
                            "order": serialized_order,
                        },
                    },
                )

        return Response(
            {
                "message": "Status updated successfully"
            }
        )


class AcceptDeliveryOrderView(APIView):

    # permission_classes = [IsAuthenticated]
    @transaction.atomic
    def patch(self, request, order_id):

        order = get_object_or_404(
            Order,
            id=order_id,
            order_type="delivery",
        )

        if order.delivery_staff:

            return Response(
                {
                    "error":
                    "Order already assigned"
                },
                status=400
            )

        order.delivery_staff = request.user
        order.delivery_status = "assigned"
        order.save()

        create_activity_log(
            restaurant=order.restaurant,
            user=request.user,
            order=order,
            action="delivery_accepted",
            message=(
                f"{request.user.username} "
                f"accepted delivery "
                f"{order.order_number}"
            ),
        )

        return Response(
            {
                "message":
                "Order accepted"
            }
        )

class UpdateDeliveryStatusView(APIView):

    def patch(self, request, order_id):

        order = get_object_or_404(
            Order,
            id=order_id,
            delivery_staff=request.user,
        )

        delivery_status = request.data.get(
            "delivery_status"
        )

        payment_status = request.data.get(
            "payment_status"
        )

        update_fields = []

        if delivery_status:
            order.delivery_status = delivery_status
            update_fields.append(
                "delivery_status"
            )

            # Auto complete order
            if delivery_status == "delivered":
                order.status = "completed"

                update_fields.append(
                    "status"
                )

        if payment_status:
            order.payment_status = payment_status

            update_fields.append(
                "payment_status"
            )

        order.save(
            update_fields=update_fields
        )

        if delivery_status:

            create_activity_log(
                restaurant=order.restaurant,
                user=request.user,
                order=order,
                action=delivery_status,
                message=(
                    f"{request.user.username} "
                    f"changed delivery "
                    f"{order.order_number} "
                    f"to "
                    f"{delivery_status}"
                ),
            )

        return Response({
            "message": "Updated"
        })
    
