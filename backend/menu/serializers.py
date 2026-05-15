# menu/serializers/category_serializer.py

from rest_framework import serializers

from .models import Category, Product


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