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


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    # Personal Info

    date_of_birth = models.DateField(
        null=True,
        blank=True
    )

    gender = models.CharField(
        max_length=20,
        blank=True
    )

    # Contact
    alternate_phone = models.CharField(
        max_length=20,
        blank=True
    )

    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True
    )

    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.email
    
class StaffProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="staff_profile"
    )

    employee_id = models.CharField(
        max_length=50,
        unique=True
    )

    joining_date = models.DateField(
        null=True,
        blank=True
    )

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    is_active_staff = models.BooleanField(
        default=True
    )

    notes = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.employee_id

class DeliveryProfile(models.Model):

    VEHICLE_CHOICES = (
        ("bike", "Bike"),
        ("scooter", "Scooter"),
        ("car", "Car"),
        ("cycle", "Cycle"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="delivery_profile"
    )

    vehicle_type = models.CharField(
        max_length=20,
        choices=VEHICLE_CHOICES
    )

    vehicle_number = models.CharField(
        max_length=30
    )

    driving_license_number = models.CharField(
        max_length=50,
        blank=True
    )

    is_available = models.BooleanField(
        default=True
    )

    current_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    current_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.user.email
    
class CustomerProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile"
    )

    loyalty_points = models.IntegerField(
        default=0
    )

    total_orders = models.IntegerField(
        default=0
    )

    total_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    last_order_date = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.user.email
    

class UserAddress(models.Model):

    user = models.ForeignKey(
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
