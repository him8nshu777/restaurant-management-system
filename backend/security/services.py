from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .serializers import UserSessionSerializer
from .models import UserSession


def create_user_session(
    *,
    user,
    session_key,
    ip_address,
    user_agent,
    device_name,
    browser,
):

    session = UserSession.objects.create(
        restaurant=user.restaurant,
        user=user,
        session_key=session_key,
        ip_address=ip_address,
        user_agent=user_agent,
        device_name=device_name,
        browser=browser,
        is_active=True,
    )

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"security_{user.restaurant.id}",
        {
            "type": "session_created",
            "data": UserSessionSerializer(session).data,
        },
    )

    return session


def logout_user_session(
    session,
):

    session.is_active = False

    session.save(
        update_fields=[
            "is_active",
        ]
    )

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"security_{session.restaurant.id}",
        {
            "type": "session_removed",
            "data": {
                "event": "session_removed",
                "id": session.id,
            },
        },
    )
