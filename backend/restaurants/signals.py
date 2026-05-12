from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Restaurant

from accounts.utils import send_restaurant_status_email


@receiver(pre_save, sender=Restaurant)
def restaurant_status_changed(sender, instance, **kwargs):

    if not instance.pk:
        return

    try:

        old_restaurant = Restaurant.objects.get(pk=instance.pk)

    except Restaurant.DoesNotExist:
        return

    old_status = old_restaurant.status

    new_status = instance.status


    if old_status != new_status:

        send_restaurant_status_email(
            instance.owner,
            new_status
        )