from django.db import models

from django.conf import settings


class Restaurant(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("active", "Active"),
        ("rejected", "Rejected"),
        ("suspended", "Suspended"),
    )

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="restaurant"
    )

    name = models.CharField(
        max_length=255
    )

    gst_number = models.CharField(
        max_length=50,
        unique=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    is_email_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name