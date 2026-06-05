from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:

        model = ActivityLog

        fields = [
            "id",
            "action",
            "message",
            "role",
            "user_name",
            "created_at",
        ]
