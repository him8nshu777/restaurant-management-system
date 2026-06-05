from rest_framework.views import APIView
from rest_framework.response import Response

from .models import UserSession
from .serializers import (
    UserSessionSerializer,
)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .services import send_force_logout, logout_user_session
    
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from audits.services import create_activity_log



class UserSessionListView(APIView):

    def get(
        self,
        request,
        restaurant_id,
    ):

        sessions = (
            UserSession.objects
            .select_related("user")
            .filter(
                restaurant_id=restaurant_id,
                is_active=True,
            )
            .order_by("-last_activity")
        )

        return Response(
            UserSessionSerializer(
                sessions,
                many=True,
            ).data
        )
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_selected_device(request):

    session_id = request.data.get("session_id")

    try:

        session = UserSession.objects.get(
            id=session_id,
            restaurant=request.user.restaurant,
            is_active=True,
        )

        logout_user_session(session)

        create_activity_log(
            restaurant=request.user.restaurant,
            user=request.user,
            action="device_logout",
            message=(
                f"{request.user.email} logged out "
                f"{session.user.email}'s device"
            ),
        )

        send_force_logout(
            user_id=session.user.id,
            session_key=session.session_key,
        )

        return Response(
            {"message": "Device logged out"}
        )

    except UserSession.DoesNotExist:

        return Response(
            {"error": "Device not found"},
            status=404,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_all_devices(request):

    sessions = UserSession.objects.filter(
        restaurant=request.user.restaurant,
        is_active=True,
    ).exclude(
        user__role="restaurant_admin",
    )

    users = set(
        sessions.values_list(
            "user_id",
            flat=True,
        )
    )


    # Force logout every logged-in user
    for user_id in users:

        send_force_logout(
            user_id=user_id,
            logout_all=True,
        )

    removed_ids = list(
    sessions.values_list("id", flat=True)
)
    sessions.update(is_active=False)

    # Update Active Devices page instantly
    channel_layer = get_channel_layer()

    create_activity_log(
        restaurant=request.user.restaurant,
        user=request.user,
        action="all_devices_logout",
        message=(
            f"{request.user.email} logged out "
            f"all active users"
        ),
    )

    async_to_sync(channel_layer.group_send)(
        f"security_{request.user.restaurant.id}",
        {
            "type": "session_removed",
            "data": {
                "event": "multiple_sessions_removed",
                "ids": removed_ids,
            },
        },
    )

    return Response(
        {"message": "All users logged out"}
    )