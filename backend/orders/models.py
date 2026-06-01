# orders/models.py

from decimal import Decimal

from django.db import models
from django.utils import timezone

from restaurants.models import Restaurant
from accounts.models import User, UserAddress
from django.db import IntegrityError
from menu.models import (
    ProductVariant,
    Combo,
    Addon,
)
from django.db.models import Count
from django.db import transaction

from restaurants.models import (
    RestaurantTable,
    Floor,
    Area,
)


# =========================================================
# ORDER
# =========================================================
class Order(models.Model):

    # =====================================================
    # ORDER TYPE
    # =====================================================
    ORDER_TYPE_CHOICES = (
        ("dine_in", "Dine In"),
        ("takeaway", "Takeaway"),
        ("delivery", "Delivery"),
    )

    # =====================================================
    # ORDER STATUS
    # =====================================================
    ORDER_STATUS_CHOICES = (
        ("pending_approval", "Pending Approval"),
        ("saved", "Saved"),
        ("running", "Running"),
        ("confirmed", "Confirmed"),
        ("preparing", "Preparing"),
        ("ready", "Ready"),
        ("served", "Served"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    # =====================================================
    # PAYMENT STATUS
    # =====================================================
    PAYMENT_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("partial", "Partial"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    )

    DELIVERY_STATUS_CHOICES = (
        ("unassigned", "Unassigned"),
        ("assigned", "Assigned"),
        ("picked_up", "Picked Up"),
        ("on_the_way", "On The Way"),
        ("delivered", "Delivered"),
    )

    delivery_status = models.CharField(
        max_length=20,
        choices=DELIVERY_STATUS_CHOICES,
        default="unassigned",
    )

    # =====================================================
    # RESTAURANT
    # =====================================================
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    # =====================================================
    # ORDER NUMBER
    # =====================================================
    order_number = models.CharField(
        max_length=50,
        unique=True,
    )

    # =====================================================
    # CUSTOMER
    # =====================================================
    customer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="customer_orders",
    )
    delivery_address = models.ForeignKey(
        UserAddress,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    # =====================================================
    # WAITER
    # =====================================================
    waiter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="waiter_orders",
        limit_choices_to={"role": "waiter"},
    )

    # =====================================================
    # DELIVERY STAFF
    # =====================================================
    delivery_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_orders",
        limit_choices_to={"role": "delivery"},
    )
    # =====================================================
    # CREATED BY STAFF
    # =====================================================
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="created_orders",
    )

    # =====================================================
    # ORDER TYPE
    # =====================================================
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE_CHOICES,
    )

    # =====================================================
    # FLOOR
    # =====================================================
    floor = models.ForeignKey(
        Floor,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="orders",
    )

    # =====================================================
    # AREA
    # =====================================================
    area = models.ForeignKey(
        Area,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="orders",
    )

    # =====================================================
    # TABLE
    # =====================================================
    table = models.ForeignKey(
        RestaurantTable,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="orders",
    )

    # =====================================================
    # GUEST COUNT
    # =====================================================
    guest_count = models.PositiveIntegerField(
        default=1,
    )

    # =====================================================
    # KOT NUMBER
    # Kitchen Order Ticket
    # =====================================================
    kot_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    # =====================================================
    # ORDER STATUS
    # =====================================================
    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default="saved",
    )

    # =====================================================
    # PAYMENT STATUS
    # =====================================================
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
    )

    # =====================================================
    # SUBTOTAL
    # =====================================================
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # DISCOUNT
    # =====================================================
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # TAX
    # =====================================================
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # SERVICE CHARGE TOTAL
    # =====================================================
    service_charge_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # ROUND OFF
    # =====================================================
    round_off_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # GRAND TOTAL
    # =====================================================
    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # NOTES
    # =====================================================
    notes = models.TextField(
        blank=True,
        null=True,
    )

    cancel_reason = models.TextField(
    blank=True,
    null=True,
    )

    # =====================================================
    # SAVE TIME
    # =====================================================
    saved_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # =====================================================
    # CONFIRMED TIME
    # =====================================================
    confirmed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    payment_method = models.CharField(
    max_length=20,
    blank=True,
    null=True,
    )

    # =====================================================
    # PAYMENT TIME
    # =====================================================
    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # =====================================================
    # CLOSED TIME
    # =====================================================
    closed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # =====================================================
    # ACTIVE ORDER
    # =====================================================
    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    inventory_deducted = models.BooleanField(
        default=False
    )

    class Meta:

        ordering = ["-id"]

    def __str__(self):

        return self.order_number

    # =====================================================
    # CALCULATE TOTALS
    # =====================================================
    def calculate_totals(self):

        subtotal = Decimal("0")

        for item in self.items.all():

            subtotal += item.total_price

            addon_total = item.addons.aggregate(
                total=models.Sum("total_price")
            )["total"] or Decimal("0")

            subtotal += addon_total

        self.subtotal = subtotal

        self.grand_total = (
            subtotal
            + self.tax_amount
            + self.service_charge_amount
            + self.round_off_amount
        )

        if self.grand_total < 0:

            self.grand_total = Decimal("0")

        self.save(
            update_fields=[
                "subtotal",
                "grand_total",
            ]
        )

    # =====================================================
    # AUTO ORDER NUMBER
    # =====================================================
    
    def save(self, *args, **kwargs):

        # =========================================
        # GENERATE ORDER NUMBER
        # =========================================
        if not self.order_number:

            today = timezone.now().strftime("%Y%m%d")

            for attempt in range(1, 1000):

                order_number = (
                    f"ORD-"
                    f"{self.restaurant.id}-"
                    f"{today}-"
                    f"{attempt:04d}"
                )

                exists = Order.objects.filter(
                    order_number=order_number
                ).exists()

                if not exists:

                    self.order_number = order_number
                    break

        # =========================================
        # SAVE
        # =========================================
        super().save(*args, **kwargs)

# =========================================================
# ORDER ITEM
# =========================================================
class OrderItem(models.Model):

    ITEM_TYPE_CHOICES = (
        ("product", "Product"),
        ("combo", "Combo"),
    )

    # =====================================================
    # ORDER
    # =====================================================
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    # =====================================================
    # ITEM TYPE
    # =====================================================
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
    )

    # =====================================================
    # PRODUCT VARIANT
    # =====================================================
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="order_items",
    )

    # =====================================================
    # COMBO
    # =====================================================
    combo = models.ForeignKey(
        Combo,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="order_items",
    )

    # =====================================================
    # ITEM NAME SNAPSHOT
    # =====================================================
    item_name = models.CharField(
        max_length=255,
    )

    # =====================================================
    # ORIGINAL PRICE
    # =====================================================
    original_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    # =====================================================
    # FINAL PRICE
    # =====================================================
    final_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    # =====================================================
    # DYNAMIC PRICING NAME
    # =====================================================
    dynamic_pricing_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    # =====================================================
    # QUANTITY
    # =====================================================
    quantity = models.PositiveIntegerField(
        default=1,
    )

    # =====================================================
    # TOTAL PRICE
    # =====================================================
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # =====================================================
    # NOTES
    # =====================================================
    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        ordering = ["id"]

    def save(self, *args, **kwargs):

        self.total_price = (
            Decimal(self.final_price)
            * self.quantity
        )

        super().save(*args, **kwargs)

    def __str__(self):

        return self.item_name


# =========================================================
# ORDER ITEM ADDON
# =========================================================
class OrderItemAddon(models.Model):

    # =====================================================
    # ORDER ITEM
    # =====================================================
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        related_name="addons",
    )

    # =====================================================
    # ADDON
    # =====================================================
    addon = models.ForeignKey(
        Addon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    # =====================================================
    # SNAPSHOT NAME
    # =====================================================
    addon_name = models.CharField(
        max_length=255,
    )

    # =====================================================
    # SNAPSHOT PRICE
    # =====================================================
    addon_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    # =====================================================
    # QUANTITY
    # =====================================================
    quantity = models.PositiveIntegerField(
        default=1,
    )

    # =====================================================
    # TOTAL
    # =====================================================
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    class Meta:

        ordering = ["id"]

    def save(self, *args, **kwargs):

        self.total_price = (
            Decimal(self.addon_price)
            * self.quantity
        )

        super().save(*args, **kwargs)

    def __str__(self):

        return self.addon_name


# =========================================================
# ORDER PAYMENT
# =========================================================
class OrderPayment(models.Model):

    PAYMENT_METHOD_CHOICES = (
        ("cash", "Cash"),
        ("card", "Card"),
        ("upi", "UPI"),
        ("wallet", "Wallet"),
        ("online", "Online"),
    )

    # =====================================================
    # ORDER
    # =====================================================
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    # =====================================================
    # PAYMENT METHOD
    # =====================================================
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
    )

    # =====================================================
    # AMOUNT
    # =====================================================
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    # =====================================================
    # TRANSACTION ID
    # =====================================================
    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    # =====================================================
    # NOTES
    # =====================================================
    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):

        return (
            f"{self.order.order_number}"
            f" - "
            f"{self.payment_method}"
        )


# =========================================================
# ORDER STATUS HISTORY
# =========================================================
class OrderStatusHistory(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    old_status = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    new_status = models.CharField(
        max_length=50,
    )

    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        ordering = ["-id"]

    def __str__(self):

        return (
            f"{self.order.order_number}"
            f" - "
            f"{self.new_status}"
        )
    
# =========================================================
# ORDER TAX
# =========================================================
class OrderTax(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="taxes",
    )

    name = models.CharField(
        max_length=255,
    )

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):

        return (
            f"{self.order.order_number}"
            f" - "
            f"{self.name}"
        )
    
# =========================================================
# ORDER SERVICE CHARGE
# =========================================================
class OrderServiceCharge(models.Model):

    CHARGE_TYPE_CHOICES = (
        ("percentage", "Percentage"),
        ("fixed", "Fixed"),
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="service_charges",
    )

    name = models.CharField(
        max_length=255,
    )

    charge_type = models.CharField(
        max_length=20,
        choices=CHARGE_TYPE_CHOICES,
    )

    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):

        return (
            f"{self.order.order_number}"
            f" - "
            f"{self.name}"
        )
    
class OrderItemTax(models.Model):

    order_item = models.ForeignKey(
        OrderItem,
        related_name="taxes",
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )
class OrderComboItem(models.Model):

    order_item = models.ForeignKey(
        OrderItem,
        related_name="combo_items",
        on_delete=models.CASCADE,
    )

    product_name = models.CharField(max_length=255)

    variant_name = models.CharField(max_length=255)

    quantity = models.PositiveIntegerField()

    allocated_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

class OrderComboItemTax(models.Model):

    combo_item = models.ForeignKey(
        OrderComboItem,
        related_name="taxes",
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

class OrderAddonTax(models.Model):

    addon = models.ForeignKey(
        OrderItemAddon,
        related_name="taxes",
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

