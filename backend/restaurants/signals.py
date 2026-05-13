"""
SIGNALS MODULE

Purpose:
- Automatically detect changes in Restaurant model
- Trigger side effects when restaurant status changes

Example use case:
- pending → active (send approval email)
- active → suspended (send suspension email)
"""

from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Restaurant
from accounts.utils import send_restaurant_status_email


@receiver(pre_save, sender=Restaurant)
def restaurant_status_changed(sender, instance, **kwargs):
    """
    Signal triggered BEFORE saving Restaurant model.

    Purpose:
    - Detect if restaurant.status field has changed
    - If changed, send email notification to restaurant owner

    Flow:
    1. Fetch existing DB record (old state)
    2. Compare old status vs new status
    3. If different → trigger email notification
    """

    # If object is new (not yet saved), skip signal
    if not instance.pk:
        return

    try:
        # Fetch existing restaurant record from database
        old_restaurant = Restaurant.objects.get(pk=instance.pk)

    except Restaurant.DoesNotExist:
        # If record does not exist, safely exit
        return

    # Old status from database
    old_status = old_restaurant.status

    # New status being saved
    new_status = instance.status

    # Trigger only if status has changed
    if old_status != new_status:

        # Send email notification to restaurant owner
        send_restaurant_status_email(
            instance.owner,
            new_status
        )