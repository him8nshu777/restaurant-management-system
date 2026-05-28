from rest_framework import serializers

from .models import Order, OrderItem, OrderItemAddon, OrderTax, OrderServiceCharge


# =========================================================
# ORDER ITEM ADDON SERIALIZER
# =========================================================
class OrderItemAddonCreateSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(required=False)

    addon_id = serializers.IntegerField()

    addon_name = serializers.CharField()

    addon_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    quantity = serializers.IntegerField(default=1)

    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
    )

    class Meta:

        model = OrderItemAddon

        fields = [
            "id",
            "addon_id",
            "addon_name",
            "addon_price",
            "quantity",
            "total_price",
        ]


# =========================================================
# ORDER ITEM SERIALIZER
# =========================================================
class OrderItemCreateSerializer(serializers.ModelSerializer):

    # =========================================
    # FOR UPDATE
    # =========================================
    id = serializers.IntegerField(required=False)

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

    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    addons = OrderItemAddonCreateSerializer(
        many=True,
        required=False,
    )

    class Meta:

        model = OrderItem

        fields = [
            "id",
            "item_type",
            "product_variant_id",
            "combo_id",
            "item_name",
            "original_price",
            "final_price",
            "dynamic_pricing_name",
            "quantity",
            "total_price",
            "notes",
            "addons",
        ]


# =========================================================
# ORDER TAX SERIALIZER
# =========================================================
class OrderTaxCreateSerializer(serializers.Serializer):

    id = serializers.IntegerField(required=False)

    name = serializers.CharField()

    percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


# =========================================================
# ORDER SERVICE CHARGE SERIALIZER
# =========================================================
class OrderServiceChargeCreateSerializer(serializers.Serializer):

    id = serializers.IntegerField(required=False)

    name = serializers.CharField()

    charge_type = serializers.CharField()

    value = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


# =========================================================
# CREATE / UPDATE ORDER SERIALIZER
# =========================================================
class CreateOrderSerializer(serializers.Serializer):

    order_type = serializers.CharField(required=True)

    # =========================================
    # WAITER
    # =========================================
    waiter_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

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

    status = serializers.CharField(required=False)

    payment_status = serializers.CharField(required=False)

    # =========================================
    # DISCOUNT
    # =========================================
    discount_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =========================================
    # ROUND OFF
    # =========================================
    round_off_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =========================================
    # TAXES
    # =========================================
    taxes = OrderTaxCreateSerializer(
        many=True,
        required=False,
    )

    # =========================================
    # SERVICE CHARGES
    # =========================================
    service_charges = OrderServiceChargeCreateSerializer(
        many=True,
        required=False,
    )

    # =========================================
    # ITEMS
    # =========================================
    items = OrderItemCreateSerializer(
        many=True,
        required=False,
    )


# =========================================================
# ORDER LIST SERIALIZER
# =========================================================
class OrderListSerializer(serializers.ModelSerializer):

    waiter_id = serializers.IntegerField(
        source="waiter.id",
        read_only=True,
    )

    waiter_name = serializers.SerializerMethodField()

    floor_name = serializers.CharField(source="floor.name", read_only=True)

    area_name = serializers.CharField(source="area.name", read_only=True)

    table_name = serializers.CharField(source="table.table_number", read_only=True)

    items = OrderItemCreateSerializer(
        many=True,
        read_only=True,
    )

    taxes = OrderTaxCreateSerializer(
        many=True,
        read_only=True,
    )

    service_charges = OrderServiceChargeCreateSerializer(
        many=True,
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
            "payment_method",
            "subtotal",
            "discount_amount",
            "tax_amount",
            "service_charge_amount",
            "round_off_amount",
            "grand_total",
            "notes",
            "floor_name",
            "area_name",
            "table_name",
            "created_at",
            # nested
            "items",
            "taxes",
            "service_charges",
            "waiter_id",
            "waiter_name",
        ]

    def get_waiter_name(self, obj):

        if obj.waiter:

            full_name = obj.waiter.username
            return full_name or obj.waiter.email

        return None
