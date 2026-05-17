# menu/serializers/category_serializer.py

from rest_framework import serializers

from .models import Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboProduct

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
