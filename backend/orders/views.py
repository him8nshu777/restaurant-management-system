from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Order,
    OrderItem,
    OrderItemAddon,
)

from .serializers import (
    CreateOrderSerializer,
    OrderListSerializer,
)


# =========================================================
# CREATE ORDER
# =========================================================
class CreateOrderView(APIView):

    @transaction.atomic
    def post(self, request, restaurant_id):

        serializer = CreateOrderSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        # =================================================
        # CREATE ORDER
        # =================================================
        order = Order.objects.create(
            restaurant_id=restaurant_id,

            created_by=request.user,

            order_type=data["order_type"],

            floor_id=data.get(
                "floor_id"
            ),

            area_id=data.get(
                "area_id"
            ),

            table_id=data.get(
                "table_id"
            ),

            guest_count=data.get(
                "guest_count",
                1,
            ),

            notes=data.get(
                "notes"
            ),

            status="saved",

            saved_at=timezone.now(),
        )

        # =================================================
        # CREATE ITEMS
        # =================================================
        for item_data in data["items"]:

            order_item = OrderItem.objects.create(
                order=order,

                item_type=item_data[
                    "item_type"
                ],

                product_variant_id=item_data.get(
                    "product_variant_id"
                ),

                combo_id=item_data.get(
                    "combo_id"
                ),

                item_name=item_data[
                    "item_name"
                ],

                original_price=item_data[
                    "original_price"
                ],

                final_price=item_data[
                    "final_price"
                ],

                dynamic_pricing_name=item_data.get(
                    "dynamic_pricing_name"
                ),

                quantity=item_data[
                    "quantity"
                ],

                notes=item_data.get(
                    "notes"
                ),
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

                    addon_id=addon_data[
                        "addon_id"
                    ],

                    addon_name=addon_data[
                        "addon_name"
                    ],

                    addon_price=addon_data[
                        "addon_price"
                    ],

                    quantity=addon_data.get(
                        "quantity",
                        1,
                    ),
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

            order.table.save()

        return Response(
            {
                "message": "Order created",
                "order_id": order.id,
                "order_number": (
                    order.order_number
                ),
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# ORDER LIST
# =========================================================
class OrderListView(APIView):

    def get(self, request, restaurant_id):

        orders = (
            Order.objects
            .filter(
                restaurant_id=restaurant_id
            )
            .select_related(
                "table"
            )
        )

        serializer = OrderListSerializer(
            orders,
            many=True,
        )

        return Response(
            serializer.data
        )
    
# =========================================================
# UPDATE ORDER
# =========================================================
class UpdateOrderView(APIView):

    @transaction.atomic
    def patch(self, request, order_id):

        try:

            order = Order.objects.get(
                id=order_id
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "error": "Order not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # =============================================
        # UPDATE BASIC FIELDS
        # =============================================
        order.status = request.data.get(
            "status",
            order.status,
        )

        order.payment_status = request.data.get(
            "payment_status",
            order.payment_status,
        )

        order.notes = request.data.get(
            "notes",
            order.notes,
        )

        order.save()

        return Response(
            {
                "message": "Order updated successfully"
            }
        )
    
# =========================================================
# DELETE ORDER
# =========================================================
class DeleteOrderView(APIView):

    @transaction.atomic
    def delete(self, request, order_id):

        try:

            order = Order.objects.get(
                id=order_id
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "error": "Order not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # =============================================
        # FREE TABLE
        # =============================================
        if order.table:

            order.table.status = "available"

            order.table.save()

        # =============================================
        # DELETE ORDER
        # =============================================
        order.delete()

        return Response(
            {
                "message": "Order deleted successfully"
            },
            status=status.HTTP_200_OK,
        )