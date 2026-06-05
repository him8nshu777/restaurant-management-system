from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import ActivityLog
from .serializers import ActivityLogSerializer

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
            "data": ActivityLogSerializer(log).data,
        },
    )

    return log
