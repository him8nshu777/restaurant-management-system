# menu/models.py

from django.db import models
from restaurants.models import Restaurant


# =========================================================
# CATEGORY MODEL
# =========================================================
# Example:
# Pizza
# Burgers
# Beverages
# Desserts
# =========================================================
class Category(models.Model):

    # =====================================================
    # CATEGORY BELONGS TO RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="categories",
    )

    # =====================================================
    # CATEGORY NAME
    # =====================================================
    name = models.CharField(max_length=100)

    # =====================================================
    # CATEGORY IMAGE
    # =====================================================
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
    )

    # =====================================================
    # CATEGORY ACTIVE STATUS
    # =====================================================
    is_active = models.BooleanField(default=True)

    # =====================================================
    # CREATED DATE
    # =====================================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["name"]

        # =================================================
        # SAME CATEGORY NAME CANNOT REPEAT
        # INSIDE SAME RESTAURANT
        # =================================================
        unique_together = [
            "restaurant",
            "name",
        ]

    def __str__(self):

        return f"{self.restaurant.name} - {self.name}"


# =========================================================
# PRODUCT MODEL
# =========================================================
# Example:
# Veg Burger
# Margherita Pizza
# Cold Coffee
# =========================================================
class Product(models.Model):

    # =====================================================
    # PRODUCT BELONGS TO RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="products",
    )

    # =====================================================
    # PRODUCT CATEGORY
    # =====================================================
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
    )

    # =====================================================
    # PRODUCT NAME
    # =====================================================
    name = models.CharField(max_length=200)

    # =====================================================
    # PRODUCT DESCRIPTION
    # =====================================================
    description = models.TextField(blank=True)

    # =====================================================
    # PRODUCT IMAGE
    # =====================================================
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )

    # =====================================================
    # BASE PRICE
    # USED WHEN PRODUCT HAS NO VARIANTS
    # =====================================================
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # =====================================================
    # VEG / NON VEG
    # =====================================================
    is_veg = models.BooleanField(default=False)

    # =====================================================
    # PRODUCT AVAILABILITY
    # =====================================================
    is_available = models.BooleanField(default=True)

    # =====================================================
    # PREPARATION TIME IN MINUTES
    # =====================================================
    preparation_time = models.IntegerField(default=15)

    # =====================================================
    # CREATED DATE
    # =====================================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["name"]

        # =================================================
        # SAME PRODUCT NAME CANNOT REPEAT
        # INSIDE SAME RESTAURANT
        # =================================================
        unique_together = [
            "restaurant",
            "name",
        ]

    def __str__(self):

        return f"{self.restaurant.name} - {self.name}"


# =========================================================
# PRODUCT VARIANT MODEL
# =========================================================
# Example:
# Small Pizza
# Medium Pizza
# Large Pizza
# =========================================================
class ProductVariant(models.Model):

    # =====================================================
    # VARIANT BELONGS TO RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="product_variants",
    )

    # =====================================================
    # PRODUCT
    # =====================================================
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    # =====================================================
    # VARIANT NAME
    # Example:
    # Small
    # Medium
    # Large
    # =====================================================
    name = models.CharField(max_length=50)

    # =====================================================
    # VARIANT PRICE
    # =====================================================
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # =====================================================
    # VARIANT STOCK
    # =====================================================
    stock = models.IntegerField(default=0)

    # =====================================================
    # VARIANT AVAILABILITY
    # =====================================================
    is_available = models.BooleanField(default=True)

    # =====================================================
    # CREATED DATE
    # =====================================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["product", "id"]

        # =================================================
        # SAME VARIANT NAME CANNOT REPEAT
        # FOR SAME PRODUCT
        # =================================================
        unique_together = [
            "product",
            "name",
        ]

    def __str__(self):

        return f"{self.product.name} - {self.name}"


# =========================================================
# ADDON MODEL
# =========================================================
# Example:
# Extra Cheese
# Extra Sauce
# Coke
# =========================================================
class Addon(models.Model):

    # =====================================================
    # ADDON BELONGS TO RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="addons",
    )

    # =====================================================
    # ADDON NAME
    # =====================================================
    name = models.CharField(max_length=100)

    # =====================================================
    # ADDON PRICE
    # =====================================================
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # =====================================================
    # ACTIVE STATUS
    # =====================================================
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["name"]

        unique_together = [
            "restaurant",
            "name",
        ]

    def __str__(self):

        return f"{self.restaurant.name} - {self.name}"


# =========================================================
# PRODUCT ADDON MAPPING
# =========================================================
class ProductAddon(models.Model):

    # =====================================================
    # PRODUCT
    # =====================================================
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_addons",
    )

    # =====================================================
    # ADDON
    # =====================================================
    addon = models.ForeignKey(
        Addon,
        on_delete=models.CASCADE,
        related_name="addon_products",
    )

    class Meta:

        unique_together = [
            "product",
            "addon",
        ]

    def __str__(self):

        return f"{self.product.name} - {self.addon.name}"


# =========================================================
# COMBO MODEL
# =========================================================
# Example:
# Burger Combo
# Family Combo
# =========================================================
class Combo(models.Model):

    # =====================================================
    # RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="combos",
    )

    # =====================================================
    # NAME
    # =====================================================
    name = models.CharField(max_length=150)

    # =====================================================
    # DESCRIPTION
    # =====================================================
    description = models.TextField(
        blank=True,
        null=True,
    )

    # =====================================================
    # IMAGE
    # =====================================================
    image = models.ImageField(
        upload_to="combo_images/",
        blank=True,
        null=True,
    )

    # =====================================================
    # COMBO PRICE
    # =====================================================
    combo_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # =====================================================
    # STATUS
    # =====================================================
    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        ordering = ["name"]

        unique_together = [
            "restaurant",
            "name",
        ]

    def __str__(self):

        return self.name


# =========================================================
# COMBO PRODUCT MAPPING
# =========================================================
class ComboProduct(models.Model):

    # =====================================================
    # COMBO
    # =====================================================
    combo = models.ForeignKey(
        Combo,
        on_delete=models.CASCADE,
        related_name="combo_products",
    )

    # =====================================================
    # PRODUCT
    # =====================================================
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_combos",
    )

    # =====================================================
    # QUANTITY
    # =====================================================
    quantity = models.PositiveIntegerField(
        default=1,
    )

    class Meta:

        unique_together = [
            "combo",
            "product",
        ]

    def __str__(self):

        return f"{self.combo.name} - {self.product.name}"

# =========================================================
# TAX MODEL
# =========================================================
# Example:
# GST 5%
# GST 18%
# =========================================================
class Tax(models.Model):

    # =====================================================
    # TAX BELONGS TO RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="taxes",
    )

    # =====================================================
    # TAX NAME
    # =====================================================
    name = models.CharField(max_length=100)

    # =====================================================
    # TAX PERCENTAGE
    # =====================================================
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    # =====================================================
    # ACTIVE STATUS
    # =====================================================
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["name"]

        unique_together = [
            "restaurant",
            "name",
        ]

    def __str__(self):

        return f"{self.name} ({self.percentage}%)"


# =========================================================
# PRODUCT TAX MAPPING
# =========================================================
class ProductTax(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_tax",
    )

    tax = models.ForeignKey(
        Tax,
        on_delete=models.CASCADE,
        related_name="tax_products",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    class Meta:

        unique_together = [
            "product",
            "tax",
        ]

    def __str__(self):

        return f"{self.product.name} - {self.tax.name}"

# =========================================================
# SERVICE CHARGE MODEL
# ex: 
    # Service fee
    # Packaging fee
    # Convenience fee
    # Dining charge
    # Delivery charge

# =========================================================
class ServiceCharge(models.Model):

    # =====================================================
    # SERVICE TYPES
    # =====================================================
    PERCENTAGE = "percentage"

    FIXED = "fixed"

    SERVICE_TYPES = [
        (PERCENTAGE, "Percentage"),
        (FIXED, "Fixed"),
    ]

    # =====================================================
    # RELATION
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="service_charges",
    )

    # =====================================================
    # BASIC INFO
    # =====================================================
    name = models.CharField(
        max_length=120,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    # =====================================================
    # CHARGE TYPE
    # =====================================================
    charge_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPES,
        default=PERCENTAGE,
    )

    # =====================================================
    # VALUE
    # =====================================================
    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # =====================================================
    # STATUS
    # =====================================================
    is_active = models.BooleanField(
        default=True,
    )

    # =====================================================
    # AUTO APPLY
    # =====================================================
    auto_apply = models.BooleanField(
        default=False,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = ["-id"]

        unique_together = (
            "restaurant",
            "name",
        )

    def __str__(self):

        return f"{self.name} - {self.restaurant.name}"

# =========================================================
# DYNAMIC PRICING
# =========================================================
class DynamicPricing(models.Model):

    PRICE_TYPE_CHOICES = (
        ("percentage_increase", "Percentage Increase"),
        ("flat_increase", "Flat Increase"),
        ("percentage_discount", "Percentage Discount"),
        ("flat_discount", "Flat Discount"),
    )

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="dynamic_pricings",
    )

    name = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    pricing_type = models.CharField(
        max_length=50,
        choices=PRICE_TYPE_CHOICES,
    )

    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    start_date = models.DateField(
        blank=True,
        null=True,
    )

    end_date = models.DateField(
        blank=True,
        null=True,
    )

    start_time = models.TimeField(
        blank=True,
        null=True,
    )

    end_time = models.TimeField(
        blank=True,
        null=True,
    )

    days = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="mon,tue,wed",
    )

    priority = models.PositiveIntegerField(
        default=1,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):

        return self.name


# =========================================================
# PRODUCT DYNAMIC PRICING
# =========================================================
class ProductDynamicPricing(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="dynamic_pricings",
    )

    dynamic_pricing = models.ForeignKey(
        DynamicPricing,
        on_delete=models.CASCADE,
        related_name="products",
    )

    class Meta:

        unique_together = (
            "product",
            "dynamic_pricing",
        )

    def __str__(self):

        return (
            f"{self.product.name} - "
            f"{self.dynamic_pricing.name}"
        )
    
# =========================================================
# OFFER MODEL
# =========================================================
class Offer(models.Model):

    # =====================================================
    # OFFER BELONGS TO RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="offers",
    )

    # =====================================================
    # OFFER NAME
    # =====================================================
    name = models.CharField(max_length=100)

    # =====================================================
    # DISCOUNT PERCENTAGE
    # =====================================================
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    # =====================================================
    # OFFER START TIME
    # =====================================================
    start_time = models.TimeField()

    # =====================================================
    # OFFER END TIME
    # =====================================================
    end_time = models.TimeField()

    # =====================================================
    # OFFER START DATE
    # =====================================================
    start_date = models.DateField()

    # =====================================================
    # OFFER END DATE
    # =====================================================
    end_date = models.DateField()

    # =====================================================
    # ACTIVE STATUS
    # =====================================================
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["-created_at"]

    def __str__(self):

        return f"{self.restaurant.name} - {self.name}"


# =========================================================
# OFFER PRODUCT MAPPING
# =========================================================
class OfferProduct(models.Model):

    offer = models.ForeignKey(
        Offer,
        on_delete=models.CASCADE,
        related_name="offer_products",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_offers",
    )

    class Meta:

        unique_together = [
            "offer",
            "product",
        ]

    def __str__(self):

        return f"{self.offer.name} - {self.product.name}"