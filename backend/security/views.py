from rest_framework.views import APIView
from rest_framework.response import Response

from .models import UserSession
from .serializers import (
    UserSessionSerializer,
)


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