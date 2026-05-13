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
    )

    email = models.EmailField(
        unique=True
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default="cashier"
    )

    phone = models.CharField(
        max_length=20,
        unique=True
    )
    
    # Every staff member belongs to one restaurant 
    restaurant = models.ForeignKey( 
        "restaurants.Restaurant", 
        on_delete=models.CASCADE, 
        related_name="staff", null=True, blank=True 
    
    )
    def __str__(self):
        return self.email