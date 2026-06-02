from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# ==========================================
# UNIT MODEL
# ==========================================
class Unit(models.Model):

    # ==========================================
    # RESTAURANT
    # ==========================================
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="units"
    )

    # ==========================================
    # UNIT NAME
    # Example:
    # Kilogram
    # Gram
    # ==========================================
    name = models.CharField(max_length=50)

    # ==========================================
    # UNIT CODE
    # Example:
    # kg
    # gm
    # ==========================================
    code = models.CharField(max_length=20)

    # ==========================================
    # ACTIVE STATUS
    # ==========================================
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        unique_together = ["restaurant", "code"]

        ordering = ["name"]

    def __str__(self):

        return self.code
    
# ==========================================
# INGREDIENT MODEL
# ==========================================
class Ingredient(models.Model):

    # ==========================================
    # RESTAURANT
    # ==========================================
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="ingredients"
    )

    # ==========================================
    # INGREDIENT NAME
    # ==========================================
    name = models.CharField(max_length=100)

    # ==========================================
    # UNIT
    # ==========================================
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="ingredients"
    )

    # ==========================================
    # CURRENT STOCK
    # ==========================================
    current_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # ==========================================
    # LOW STOCK ALERT
    # ==========================================
    low_stock_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # ==========================================
    # COST PRICE
    # ==========================================
    cost_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # ==========================================
    # ACTIVE STATUS
    # ==========================================
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["name"]

        unique_together = [
            "restaurant",
            "name",
        ]

    def __str__(self):

        return self.name
    
# ==========================================
# SUPPLIER MODEL
# ==========================================
class Supplier(models.Model):

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="suppliers"
    )

    name = models.CharField(max_length=100)

    phone = models.CharField(max_length=20)

    email = models.EmailField(blank=True, null=True)

    address = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["name"]

    def __str__(self):

        return self.name
    
# ==========================================
# INVENTORY TRANSACTION
# ==========================================
class InventoryTransaction(models.Model):

    TRANSACTION_TYPES = (
        ("purchase", "Purchase"),
        ("sale", "Sale"),
        ("adjustment", "Adjustment"),
    )

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=3
    )

    note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

class Purchase(models.Model):

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="purchases"
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="purchases"
    )

    invoice_number = models.CharField(
        max_length=100,
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    purchase_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

# ==========================================
# PRODUCT RECIPE
# ==========================================
class ProductRecipe(models.Model):

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="product_recipes"
    )

    product_variant = models.ForeignKey(
        "menu.ProductVariant",
        on_delete=models.CASCADE,
        related_name="recipes"
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="product_recipes"
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=3
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        unique_together = [
            "product_variant",
            "ingredient",
        ]

    def __str__(self):

        return (
            f"{self.product_variant.name} - "
            f"{self.ingredient.name}"
        )


# ==========================================
# COMBO RECIPE
# ==========================================
class ComboRecipe(models.Model):

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="combo_recipes"
    )

    combo = models.ForeignKey(
        "menu.Combo",
        on_delete=models.CASCADE,
        related_name="recipes"
    )

    product_variant = models.ForeignKey(
        "menu.ProductVariant",
        on_delete=models.CASCADE,
        related_name="combo_recipes"
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        unique_together = [
            "combo",
            "product_variant",
        ]

    def __str__(self):

        return (
            f"{self.combo.name} - "
            f"{self.product_variant.name}"
        )
