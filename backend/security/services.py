from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .serializers import UserSessionSerializer
from .models import UserSession

from django.contrib.sessions.models import Session
from django.db import transaction


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


@transaction.atomic
def logout_all_devices(user):
    # 1. Get all session keys
    sessions = UserSession.objects.filter(user=user, is_active=True)

    session_keys = list(sessions.values_list("session_key", flat=True))

    # 2. Mark inactive in DB
    sessions.update(is_active=False)

    # 3. Delete Django sessions
    Session.objects.filter(
        session_key__in=session_keys
    ).delete()


def send_force_logout(user_id, session_key=None, logout_all=False):


    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "force_logout",
            "session_key": session_key,
            "logout_all": logout_all,
            "message": "You have been logged out by admin"
        }
    )