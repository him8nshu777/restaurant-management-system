from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import ActivityLog


def create_activity_log(
    *,
    restaurant,
    user,
    action,
    message,
    order=None,
):

    log = ActivityLog.objects.create(
        restaurant=restaurant,
        user=user,
        order=order,
        role=user.role,
        action=action,
        message=message,
    )

    channel_layer = get_channel_layer()

    print(
        "SENDING TO:",
        f"audit_{restaurant.id}"
    )
    async_to_sync(channel_layer.group_send)(
        f"audit_{restaurant.id}",
        {
            "type": "activity_log_created",
            "data": {
                "id": log.id,
                "action": log.action,
                "message": log.message,
                "role": log.role,
                "user": user.username,
                "created_at": log.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            },
        },
    )

    return log
