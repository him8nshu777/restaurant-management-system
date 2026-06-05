from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
)

from .models import ActivityLog
from .serializers import (
    ActivityLogSerializer,
)


class ActivityLogListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        restaurant_id,
    ):

        logs = ActivityLog.objects.filter(restaurant_id=restaurant_id).select_related(
            "user",
            "order",
        )[:100]

        serializer = ActivityLogSerializer(
            logs,
            many=True,
        )

        return Response(serializer.data)
