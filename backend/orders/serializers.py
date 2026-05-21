from rest_framework import serializers

from .models import (
    Order,
    OrderItem,
    OrderItemAddon,
)


# =========================================================
# ORDER ITEM ADDON SERIALIZER
# =========================================================
class OrderItemAddonCreateSerializer(
    serializers.Serializer
):

    addon_id = serializers.IntegerField()

    addon_name = serializers.CharField()

    addon_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    quantity = serializers.IntegerField(
        default=1
    )


# =========================================================
# ORDER ITEM SERIALIZER
# =========================================================
class OrderItemCreateSerializer(
    serializers.Serializer
):

    item_type = serializers.CharField()

    product_variant_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    combo_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    item_name = serializers.CharField()

    original_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    final_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    dynamic_pricing_name = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    quantity = serializers.IntegerField()

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    addons = OrderItemAddonCreateSerializer(
        many=True,
        required=False,
    )


# =========================================================
# CREATE ORDER SERIALIZER
# =========================================================
class CreateOrderSerializer(
    serializers.Serializer
):

    order_type = serializers.CharField()

    floor_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    area_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    table_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    guest_count = serializers.IntegerField(
        default=1,
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    payment_method = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    items = OrderItemCreateSerializer(
        many=True
    )


# =========================================================
# ORDER LIST SERIALIZER
# =========================================================
class OrderListSerializer(
    serializers.ModelSerializer
):

    table_name = serializers.CharField(
        source="table.table_number",
        read_only=True,
    )

    class Meta:

        model = Order

        fields = [
            "id",
            "order_number",
            "order_type",
            "status",
            "payment_status",
            "grand_total",
            "table_name",
            "created_at",
        ]