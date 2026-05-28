from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ("super_admin", "Super Admin"),
        ("restaurant_admin", "Restaurant Admin"),
        ("cashier", "Cashier"),
        ("waiter", "Waiter"),
        ("kitchen", "Kitchen"),
        ("manager", "Manager"),
        ("delivery", "Delivery"),
        ("customer", "Customer"),
    )

    email = models.EmailField(unique=True)

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="cashier")

    phone = models.CharField(max_length=20, unique=True)

    # Every staff member belongs to one restaurant
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="staff",
        null=True,
        blank=True,
    )

    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.email


class CustomerAddress(models.Model):

    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="addresses"
    )

    label = models.CharField(max_length=50, default="Home")

    address_line_1 = models.CharField(max_length=255)

    address_line_2 = models.CharField(max_length=255, blank=True)

    landmark = models.CharField(max_length=255, blank=True)

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100)

    pincode = models.CharField(max_length=10)

    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    location_updated_at = models.DateTimeField(null=True, blank=True)
    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
