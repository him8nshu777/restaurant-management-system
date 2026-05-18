from rest_framework import serializers

from restaurants.models import Restaurant

from .models import (
    Unit,
    Ingredient,
    Supplier,
    InventoryTransaction,
    Purchase,

    ProductRecipe,
    ComboRecipe,
)




# ==========================================
# UNIT SERIALIZERS
# ==========================================
class UnitListSerializer(serializers.ModelSerializer):

    class Meta:

        model = Unit

        fields = (
            "id",
            "name",
            "code",
            "is_active",
            "created_at",
        )


class UnitCreateSerializer(serializers.ModelSerializer):

    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:

        model = Unit

        fields = (
            "id",
            "name",
            "code",
            "restaurant_id",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop("restaurant_id")

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user,
        )

        unit = Unit.objects.create(restaurant=restaurant, **validated_data)

        return unit


class UnitUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Unit

        fields = (
            "name",
            "code",
            "is_active",
        )


# ==========================================
# INGREDIENT SERIALIZERS
# ==========================================
class IngredientListSerializer(serializers.ModelSerializer):

    unit_name = serializers.CharField(
        source="unit.name",
        read_only=True,
    )

    unit_code = serializers.CharField(
        source="unit.code",
        read_only=True,
    )

    class Meta:

        model = Ingredient

        fields = (
            "id",
            "name",
            "unit",
            "unit_name",
            "unit_code",
            "current_stock",
            "low_stock_threshold",
            "cost_per_unit",
            "is_active",
            "created_at",
        )


class IngredientCreateSerializer(serializers.ModelSerializer):

    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:

        model = Ingredient

        fields = (
            "id",
            "name",
            "unit",
            "current_stock",
            "low_stock_threshold",
            "cost_per_unit",
            "restaurant_id",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop("restaurant_id")

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user,
        )

        ingredient = Ingredient.objects.create(restaurant=restaurant, **validated_data)

        return ingredient


class IngredientUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Ingredient

        fields = (
            "name",
            "unit",
            "current_stock",
            "low_stock_threshold",
            "cost_per_unit",
            "is_active",
        )


# ==========================================
# SUPPLIER SERIALIZERS
# ==========================================
class SupplierListSerializer(serializers.ModelSerializer):

    class Meta:

        model = Supplier

        fields = (
            "id",
            "name",
            "phone",
            "email",
            "address",
            "is_active",
            "created_at",
        )


class SupplierCreateSerializer(serializers.ModelSerializer):

    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:

        model = Supplier

        fields = (
            "id",
            "name",
            "phone",
            "email",
            "address",
            "restaurant_id",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop("restaurant_id")

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user,
        )

        supplier = Supplier.objects.create(restaurant=restaurant, **validated_data)

        return supplier


class SupplierUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Supplier

        fields = (
            "name",
            "phone",
            "email",
            "address",
            "is_active",
        )


# ==========================================
# INVENTORY TRANSACTION LIST SERIALIZER
# ==========================================
class InventoryTransactionListSerializer(
    serializers.ModelSerializer
):

    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True
    )

    unit_code = serializers.CharField(
        source="ingredient.unit.code",
        read_only=True
    )

    class Meta:

        model = InventoryTransaction

        fields = (
            "id",
            "ingredient",
            "ingredient_name",
            "transaction_type",
            "quantity",
            "unit_code",
            "note",
            "created_at",
        )


# ==========================================
# INVENTORY TRANSACTION CREATE SERIALIZER
# ==========================================
class InventoryTransactionCreateSerializer(
    serializers.ModelSerializer
):

    restaurant_id = serializers.IntegerField(
        write_only=True
    )

    class Meta:

        model = InventoryTransaction

        fields = (
            "id",
            "restaurant_id",
            "ingredient",
            "transaction_type",
            "quantity",
            "note",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop(
            "restaurant_id"
        )

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user
        )

        ingredient = validated_data["ingredient"]

        transaction_type = validated_data[
            "transaction_type"
        ]

        quantity = validated_data["quantity"]

        # ======================================
        # CREATE TRANSACTION
        # ======================================
        transaction = (
            InventoryTransaction.objects.create(
                restaurant=restaurant,
                **validated_data
            )
        )

        # ======================================
        # UPDATE STOCK
        # ======================================
        if transaction_type == "purchase":

            ingredient.current_stock += quantity

        elif transaction_type in [
            "sale",
            "adjustment",
        ]:

            ingredient.current_stock -= quantity

        ingredient.save()

        return transaction


# ==========================================
# PURCHASE LIST SERIALIZER
# ==========================================
class PurchaseListSerializer(
    serializers.ModelSerializer
):

    supplier_name = serializers.CharField(
        source="supplier.name",
        read_only=True
    )

    class Meta:

        model = Purchase

        fields = (
            "id",
            "supplier",
            "supplier_name",
            "invoice_number",
            "total_amount",
            "purchase_date",
            "created_at",
        )


# ==========================================
# PURCHASE CREATE SERIALIZER
# ==========================================
class PurchaseCreateSerializer(
    serializers.ModelSerializer
):

    restaurant_id = serializers.IntegerField(
        write_only=True
    )

    class Meta:

        model = Purchase

        fields = (
            "id",
            "restaurant_id",
            "supplier",
            "invoice_number",
            "total_amount",
            "purchase_date",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop(
            "restaurant_id"
        )

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user
        )

        purchase = Purchase.objects.create(
            restaurant=restaurant,
            **validated_data
        )

        return purchase


# ==========================================
# PURCHASE UPDATE SERIALIZER
# ==========================================
class PurchaseUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Purchase

        fields = (
            "supplier",
            "invoice_number",
            "total_amount",
            "purchase_date",
        )


# ==========================================
# PRODUCT RECIPE LIST SERIALIZER
# ==========================================
class ProductRecipeListSerializer(
    serializers.ModelSerializer
):

    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True
    )

    variant_name = serializers.SerializerMethodField()

    unit_code = serializers.CharField(
        source="ingredient.unit.code",
        read_only=True
    )

    class Meta:

        model = ProductRecipe

        fields = (
            "id",
            "product_variant",
            "variant_name",
            "ingredient",
            "ingredient_name",
            "quantity",
            "unit_code",
            "created_at",
        )

    def get_variant_name(self, obj):

        return (
            f"{obj.product_variant.product.name} - "
            f"{obj.product_variant.name}"
        )

# ==========================================
# PRODUCT RECIPE CREATE SERIALIZER
# ==========================================
class ProductRecipeCreateSerializer(
    serializers.ModelSerializer
):

    restaurant_id = serializers.IntegerField(
        write_only=True
    )

    class Meta:

        model = ProductRecipe

        fields = (
            "id",
            "restaurant_id",
            "product_variant",
            "ingredient",
            "quantity",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop(
            "restaurant_id"
        )

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user,
        )

        recipe = ProductRecipe.objects.create(
            restaurant=restaurant,
            **validated_data
        )

        return recipe


# ==========================================
# PRODUCT RECIPE UPDATE SERIALIZER
# ==========================================
class ProductRecipeUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ProductRecipe

        fields = (
            "ingredient",
            "quantity",
        )


# ==========================================
# COMBO RECIPE LIST SERIALIZER
# ==========================================
class ComboRecipeListSerializer(
    serializers.ModelSerializer
):

    combo_name = serializers.CharField(
        source="combo.name",
        read_only=True
    )

    variant_name = serializers.SerializerMethodField()

    class Meta:

        model = ComboRecipe

        fields = (
            "id",
            "combo",
            "combo_name",
            "product_variant",
            "variant_name",
            "quantity",
            "created_at",
        )

    def get_variant_name(self, obj):

        return (
            f"{obj.product_variant.product.name} - "
            f"{obj.product_variant.name}"
        )


# ==========================================
# COMBO RECIPE CREATE SERIALIZER
# ==========================================
class ComboRecipeCreateSerializer(
    serializers.ModelSerializer
):

    restaurant_id = serializers.IntegerField(
        write_only=True
    )

    class Meta:

        model = ComboRecipe

        fields = (
            "id",
            "restaurant_id",
            "combo",
            "product_variant",
            "quantity",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop(
            "restaurant_id"
        )

        restaurant = Restaurant.objects.get(
            id=restaurant_id,
            owner=request.user,
        )

        combo_recipe = ComboRecipe.objects.create(
            restaurant=restaurant,
            **validated_data
        )

        return combo_recipe


# ==========================================
# COMBO RECIPE UPDATE SERIALIZER
# ==========================================
class ComboRecipeUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ComboRecipe

        fields = (
            "product_variant",
            "quantity",
        )