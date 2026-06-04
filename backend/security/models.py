from django.db import models

from accounts.models import User
from restaurants.models import Restaurant


class UserSession(models.Model):

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="user_sessions",
        db_index=True,
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_sessions",
        db_index=True,
    )

    session_key = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    user_agent = models.TextField()

    device_name = models.CharField(
        max_length=255,
        blank=True,
    )

    browser = models.CharField(
        max_length=100,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    login_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    last_activity = models.DateTimeField(
        auto_now=True,
        db_index=True,
    )

    class Meta:

        ordering = ["-last_activity"]

        indexes = [
            models.Index(fields=["restaurant"]),
            models.Index(fields=["user"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["login_at"]),
            models.Index(fields=["last_activity"]),
            models.Index(fields=["restaurant", "is_active"]),
        ]

    def __str__(self):

        return f"{self.user.username} - " f"{self.device_name}"
