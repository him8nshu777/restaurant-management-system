from rest_framework import serializers

from .models import (
    Order,
    OrderItem,
    OrderItemAddon,
    OrderTax,
    OrderServiceCharge,
    OrderAddonTax,
    OrderItemTax,
    OrderComboItemTax,
    OrderComboItem,
)


# =========================================================
# ADDON TAX READ SERIALIZER
# =========================================================
class OrderAddonTaxSerializer(serializers.ModelSerializer):

    class Meta:

        model = OrderAddonTax

        fields = [
            "id",
            "name",
            "percentage",
        ]


# =========================================================
# ITEM TAX READ SERIALIZER
# =========================================================
class OrderItemTaxSerializer(serializers.ModelSerializer):

    class Meta:

        model = OrderItemTax

        fields = [
            "id",
            "name",
            "percentage",
        ]


# =========================================================
# COMBO ITEM TAX READ SERIALIZER
# =========================================================
class OrderComboItemTaxSerializer(serializers.ModelSerializer):

    class Meta:

        model = OrderComboItemTax

        fields = [
            "id",
            "name",
            "percentage",
        ]


# =========================================================
# COMBO ITEM READ SERIALIZER
# =========================================================
class OrderComboItemSerializer(serializers.ModelSerializer):

    taxes = OrderComboItemTaxSerializer(
        many=True,
        read_only=True,
    )

    class Meta:

        model = OrderComboItem

        fields = [
            "id",
            "product_name",
            "variant_name",
            "quantity",
            "allocated_price",
            "taxes",
        ]


# =========================================================
# ADDON WRITE SERIALIZER
# USED FOR CREATE / UPDATE
# =========================================================
class OrderItemAddonWriteSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(
        required=False,
    )

    addon_id = serializers.IntegerField()

    quantity = serializers.IntegerField(
        default=1,
    )

    class Meta:

        model = OrderItemAddon

        fields = [
            "id",
            "addon_id",
            "quantity",
        ]


# =========================================================
# ADDON READ SERIALIZER
# USED FOR LIST / DETAIL
# =========================================================
class OrderItemAddonReadSerializer(serializers.ModelSerializer):

    taxes = OrderAddonTaxSerializer(
        many=True,
        read_only=True,
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
            "taxes",
        ]


# =========================================================
# ITEM WRITE SERIALIZER
# USED FOR CREATE / UPDATE
# =========================================================
class OrderItemWriteSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(
        required=False,
    )

    item_type = serializers.CharField()

    product_variant_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    combo_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    quantity = serializers.IntegerField()

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    addons = OrderItemAddonWriteSerializer(
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
            "quantity",
            "notes",
            "addons",
        ]


# =========================================================
# ITEM READ SERIALIZER
# USED FOR LIST / DETAIL
# =========================================================
class OrderItemReadSerializer(serializers.ModelSerializer):

    addons = OrderItemAddonReadSerializer(
        many=True,
        read_only=True,
    )

    taxes = OrderItemTaxSerializer(
        many=True,
        read_only=True,
    )

    combo_items = OrderComboItemSerializer(
        many=True,
        read_only=True,
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
            "taxes",
            "combo_items",
        ]


# =========================================================
# ORDER TAX SERIALIZER
# =========================================================
class OrderTaxCreateSerializer(serializers.Serializer):

    id = serializers.IntegerField(
        required=False,
    )

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

    id = serializers.IntegerField(
        required=False,
    )

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

    order_type = serializers.CharField(
        required=True,
    )

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

    status = serializers.CharField(
        required=False,
    )

    payment_status = serializers.CharField(
        required=False,
    )

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
    items = OrderItemWriteSerializer(
        many=True,
        required=False,
    )

    delivery_address_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

# =========================================================
# ORDER LIST SERIALIZER
# =========================================================


class OrderListSerializer(serializers.ModelSerializer):

    restaurant_name = serializers.CharField(
        source="restaurant.name",
        read_only=True,
    )

    waiter_id = serializers.IntegerField(
        source="waiter.id",
        read_only=True,
    )

    waiter_name = serializers.SerializerMethodField()

    floor_name = serializers.CharField(
        source="floor.name",
        read_only=True,
    )

    area_name = serializers.CharField(
        source="area.name",
        read_only=True,
    )

    table_name = serializers.CharField(
        source="table.table_number",
        read_only=True,
    )
    table_id = serializers.IntegerField(
        source="table.id",
        read_only=True,
    )

    floor_id = serializers.IntegerField(
        source="floor.id",
        read_only=True,
    )

    area_id = serializers.IntegerField(
        source="area.id",
        read_only=True,
    )

    items = OrderItemReadSerializer(
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
    kitchen_started_at = serializers.SerializerMethodField()

    customer_name = serializers.CharField(source="customer.username", read_only=True)

    customer_phone = serializers.CharField(source="customer.phone", read_only=True)

    delivery_status = serializers.CharField()

    delivery_staff_id = serializers.IntegerField(
        source="delivery_staff.id", read_only=True
    )
    delivery_address = serializers.SerializerMethodField()
    completed_at = serializers.DateTimeField(source="updated_at", read_only=True)
    class Meta:

        model = Order

        fields = [
            "id",
            "restaurant_name",
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
            "table_id",
            "floor_id",
            "area_id",
            "created_at",
            "completed_at",
            # nested
            "items",
            "taxes",
            "service_charges",
            "waiter_id",
            "waiter_name",
            "kitchen_started_at",
            "customer_name",
            "customer_phone",
            "delivery_status",
            "delivery_staff_id",
            "delivery_address",
        ]

    def get_waiter_name(self, obj):

        if obj.waiter:

            full_name = obj.waiter.username

            return full_name or obj.waiter.email

        return None

    def get_kitchen_started_at(self, obj):

        if obj.status in [
            "confirmed",
            "preparing",
            "ready",
        ]:
            dt = obj.confirmed_at or obj.saved_at or obj.created_at
        else:
            dt = obj.saved_at or obj.created_at

        return dt.isoformat() if dt else None

    def get_delivery_address(self, obj):

        if not obj.delivery_address:
            return None

        return f"{obj.delivery_address.address_line_1}, " f"{obj.delivery_address.city}"
