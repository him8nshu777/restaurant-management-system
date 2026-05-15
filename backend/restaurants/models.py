from django.db import models

from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class Restaurant(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("active", "Active"),
        ("rejected", "Rejected"),
        ("suspended", "Suspended"),
    )

    # ==========================================
    # ONE OWNER CAN HAVE MULTIPLE BRANCHES
    # ==========================================
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_restaurant",
    )

    name = models.CharField(max_length=255)

    gst_number = models.CharField(max_length=50, unique=True)

    address = models.TextField(blank=True)

    # ==========================================
    # DEFAULT RESTAURANT CREATED ON REGISTRATION
    # ==========================================
    is_primary = models.BooleanField(default=False)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    is_email_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ==========================================
# FLOOR MODEL
# ==========================================
class Floor(models.Model):

    # ==========================================
    # FLOOR BELONGS TO RESTAURANT
    # ==========================================
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="floors"
    )

    # ==========================================
    # FLOOR NAME
    # Example:
    # Ground Floor
    # First Floor
    # Rooftop
    # ==========================================
    name = models.CharField(max_length=100)

    # ==========================================
    # FLOOR NUMBER
    # Example:
    # Ground = 0
    # First = 1
    # ==========================================
    floor_number = models.IntegerField()

    # ==========================================
    # ACTIVE STATUS
    # ==========================================
    is_active = models.BooleanField(default=True)

    # ==========================================
    # CREATED DATE
    # ==========================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["floor_number"]

        unique_together = [
            "restaurant",
            "floor_number",
        ]

    def __str__(self):

        return f"{self.restaurant.name} - {self.name}"

    # ==========================================
    # BRANCH RELATION
    # ==========================================
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="floors"
    )

    # ==========================================
    # FLOOR NAME
    # ==========================================
    name = models.CharField(max_length=100)

    # ==========================================
    # FLOOR NUMBER
    # Example:
    # Ground Floor = 0
    # First Floor = 1
    # ==========================================
    floor_number = models.IntegerField()

    # ==========================================
    # ACTIVE STATUS
    # ==========================================
    is_active = models.BooleanField(default=True)

    # ==========================================
    # CREATED DATE
    # ==========================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["floor_number"]

        unique_together = [
            "restaurant",
            "floor_number",
        ]

    def __str__(self):

        return f"{self.restaurant.name} - {self.name}"


# ==========================================
# AREA MODEL
# ==========================================
class Area(models.Model):

    AREA_TYPES = (
        ("indoor", "Indoor"),
        ("outdoor", "Outdoor"),
        ("vip", "VIP"),
        ("smoking", "Smoking"),
    )

    # ==========================================
    # RESTAURANT
    # ==========================================
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="areas"
    )

    # ==========================================
    # FLOOR
    # ==========================================
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="areas")

    # ==========================================
    # AREA NAME
    # ==========================================
    name = models.CharField(max_length=100)

    # ==========================================
    # AREA TYPE
    # ==========================================
    area_type = models.CharField(max_length=20, choices=AREA_TYPES, default="indoor")

    # ==========================================
    # ACTIVE STATUS
    # ==========================================
    is_active = models.BooleanField(default=True)

    # ==========================================
    # CREATED DATE
    # ==========================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["id"]

    def __str__(self):

        return f"{self.floor.name} - {self.name}"


# ==========================================
# RESTAURANT TABLE MODEL
# ==========================================
class RestaurantTable(models.Model):

    # ==========================================
    # TABLE STATUS CHOICES
    # ==========================================
    STATUS_CHOICES = (
        ("available", "Available"),
        ("occupied", "Occupied"),
        ("reserved", "Reserved"),
        ("cleaning", "Cleaning"),
    )

    # ==========================================
    # RESTAURANT RELATION
    # ==========================================
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="tables"
    )

    # ==========================================
    # FLOOR RELATION
    # ==========================================
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="tables")

    # ==========================================
    # AREA RELATION
    # ==========================================
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="tables")

    # ==========================================
    # TABLE NUMBER
    # Example:
    # T1
    # T2
    # A1
    # ==========================================
    table_number = models.CharField(max_length=20)

    # ==========================================
    # TABLE CAPACITY
    # Example:
    # 2 seater
    # 4 seater
    # ==========================================
    capacity = models.IntegerField(default=2)

    # ==========================================
    # TABLE STATUS
    # ==========================================
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )

    # ==========================================
    # ASSIGNED WAITER
    # ==========================================
    assigned_waiter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tables",
    )

    # ==========================================
    # ACTIVE STATUS
    # ==========================================
    is_active = models.BooleanField(default=True)

    # ==========================================
    # CREATED DATE
    # ==========================================
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        ordering = ["table_number"]

        unique_together = [
            "restaurant",
            "table_number",
        ]

    def __str__(self):

        return self.table_number
