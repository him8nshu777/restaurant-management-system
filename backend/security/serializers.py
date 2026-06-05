from rest_framework import serializers

from .models import UserSession


class UserSessionSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:

        model = UserSession

        fields = [
            "id",
            "user_name",
            "device_name",
            "browser",
            "ip_address",
            "is_active",
            "last_activity",
            "login_at",
        ]
