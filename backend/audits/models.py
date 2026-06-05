from django.db import models

from accounts.models import User
from orders.models import Order
from restaurants.models import Restaurant


class ActivityLog(models.Model):

    ACTION_CHOICES = (
        ("login", "Login"),
        ("logout", "Logout"),

        ("order_created", "Order Created"),
        ("order_updated", "Order Updated"),
        ("order_deleted", "Order Deleted"),

        ("confirmed", "Confirmed"),
        ("preparing", "Preparing"),
        ("ready", "Ready"),
        ("served", "Served"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),

        ("waiter_changed", "Waiter Changed"),

        ("delivery_accepted", "Delivery Accepted"),
        ("picked_up", "Picked Up"),
        ("on_the_way", "On The Way"),
        ("delivered", "Delivered"),

        ("device_logout", "Device Logout"),
        ("all_devices_logout", "All Devices Logout"),
        ("forced_logout", "Forced Logout"),
    )

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="activity_logs",
        db_index=True,
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        db_index=True,
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_index=True,
    )

    role = models.CharField(
        max_length=50,
        db_index=True,
    )

    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        db_index=True,
    )

    message = models.CharField(
        max_length=255,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:

        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["restaurant"]),
            models.Index(fields=["user"]),
            models.Index(fields=["order"]),
            models.Index(fields=["action"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["restaurant", "created_at"]),
            models.Index(fields=["restaurant", "action"]),
        ]
    def __str__(self):

        return f"{self.user} - {self.action}"
