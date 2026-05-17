# menu/serializers/category_serializer.py

from rest_framework import serializers

from .models import Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboProduct, Tax, ProductTax, ServiceCharge, DynamicPricing, ProductDynamicPricing

# =========================================================
# CATEGORY SERIALIZER
# =========================================================
class CategorySerializer(serializers.ModelSerializer):

    # =====================================================
    # RETURN FULL IMAGE URL
    # =====================================================
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        use_url=True,
    )

    class Meta:

        model = Category

        fields = [
            "id",
            "restaurant",
            "name",
            "image",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "restaurant",
            "created_at",
        ]

    # =====================================================
    # CONVERT IMAGE TO FULL URL
    # =====================================================
    def to_representation(self, instance):

        representation = super().to_representation(instance)

        request = self.context.get("request")

        if (
            instance.image
            and request
        ):

            representation["image"] = (
                request.build_absolute_uri(
                    instance.image.url
                )
            )

        return representation

# =========================================================
# PRODUCT SERIALIZER
# =========================================================
class ProductSerializer(serializers.ModelSerializer):

    # =====================================================
    # PRODUCT IMAGE
    # =====================================================
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        use_url=True,
    )

    # =====================================================
    # CATEGORY NAME
    # =====================================================
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:

        model = Product

        fields = [
            "id",
            "restaurant",
            "category",
            "category_name",
            "name",
            "description",
            "image",
            "base_price",
            "is_veg",
            "is_available",
            "preparation_time",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "restaurant",
            "created_at",
        ]

    # =====================================================
    # RETURN FULL IMAGE URL
    # =====================================================
    def to_representation(self, instance):

        representation = super().to_representation(instance)

        request = self.context.get("request")

        if instance.image and request:

            representation["image"] = (
                request.build_absolute_uri(
                    instance.image.url
                )
            )

        return representation
    

# =========================================================
# PRODUCT VARIANT SERIALIZER
# =========================================================
class ProductVariantSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:

        model = ProductVariant

        fields = [
            "id",
            "restaurant",
            "product",
            "product_name",
            "name",
            "price",
            "stock",
            "is_available",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "restaurant",
            "created_at",
        ]



# =========================================================
# ADDON SERIALIZER
# =========================================================
class AddonSerializer(serializers.ModelSerializer):

    class Meta:

        model = Addon

        fields = [
            "id",
            "restaurant",
            "name",
            "price",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


# =========================================================
# PRODUCT ADDON SERIALIZER
# =========================================================
class ProductAddonSerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    addon_name = serializers.CharField(
        source="addon.name",
        read_only=True,
    )

    addon_price = serializers.DecimalField(
        source="addon.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:

        model = ProductAddon

        fields = [
            "id",
            "product",
            "product_name",
            "addon",
            "addon_name",
            "addon_price",
        ]

# =========================================================
# COMBO SERIALIZER
# =========================================================
class ComboSerializer(serializers.ModelSerializer):

    # =====================================================
    # RETURN FULL IMAGE URL
    # =====================================================
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        use_url=True,
    )

    class Meta:

        model = Combo

        fields = [
            "id",
            "restaurant",
            "name",
            "description",
            "image",
            "combo_price",
            "is_active",
        ]

    # =====================================================
    # CONVERT IMAGE TO FULL URL
    # =====================================================
    def to_representation(self, instance):

        representation = super().to_representation(instance)

        request = self.context.get("request")

        if (
            instance.image
            and request
        ):

            representation["image"] = (
                request.build_absolute_uri(
                    instance.image.url
                )
            )

        return representation

# =========================================================
# COMBO PRODUCT SERIALIZER
# =========================================================
class ComboProductSerializer(
    serializers.ModelSerializer
):

    combo_name = serializers.CharField(
        source="combo.name",
        read_only=True,
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:

        model = ComboProduct

        fields = [
            "id",
            "combo",
            "combo_name",
            "product",
            "product_name",
            "quantity",
        ]


# =========================================================
# TAX SERIALIZER
# =========================================================
class TaxSerializer(serializers.ModelSerializer):

    class Meta:

        model = Tax

        fields = [
            "id",
            "restaurant",
            "name",
            "percentage",
            "is_active",
            "created_at",
        ]


# =========================================================
# PRODUCT TAX SERIALIZER
# =========================================================
class ProductTaxSerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    tax_name = serializers.CharField(
        source="tax.name",
        read_only=True,
    )

    tax_percentage = serializers.DecimalField(
        source="tax.percentage",
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )

    class Meta:

        model = ProductTax

        fields = [
            "id",
            "product",
            "product_name",
            "tax",
            "tax_name",
            "tax_percentage",
        ]

# =========================================================
# SERVICE CHARGE SERIALIZER
# =========================================================
class ServiceChargeSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ServiceCharge

        fields = [
            "id",
            "restaurant",
            "name",
            "description",
            "charge_type",
            "value",
            "is_active",
            "auto_apply",
        ]

from rest_framework import serializers

# =========================================================
# DYNAMIC PRICING SERIALIZER
# =========================================================
class DynamicPricingSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = DynamicPricing

        fields = "__all__"


# =========================================================
# PRODUCT DYNAMIC PRICING SERIALIZER
# =========================================================
class ProductDynamicPricingSerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    dynamic_pricing_name = serializers.CharField(
        source="dynamic_pricing.name",
        read_only=True,
    )

    pricing_type = serializers.CharField(
        source="dynamic_pricing.pricing_type",
        read_only=True,
    )

    pricing_value = serializers.DecimalField(
        source="dynamic_pricing.value",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:

        model = ProductDynamicPricing

        fields = [
            "id",
            "product",
            "product_name",
            "dynamic_pricing",
            "dynamic_pricing_name",
            "pricing_type",
            "pricing_value",
        ]

    # =====================================================
    # VALIDATE DUPLICATE
    # =====================================================
    def validate(self, attrs):

        product = attrs.get("product")
        dynamic_pricing = attrs.get(
            "dynamic_pricing"
        )

        queryset = ProductDynamicPricing.objects.filter(
            product=product,
            dynamic_pricing=dynamic_pricing,
        )

        if self.instance:

            queryset = queryset.exclude(
                id=self.instance.id
            )

        if queryset.exists():

            raise serializers.ValidationError(
                {
                    "message":
                    "This pricing rule is already mapped to this product."
                }
            )

        return attrs