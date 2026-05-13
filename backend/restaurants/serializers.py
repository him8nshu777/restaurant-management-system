from rest_framework import serializers

from accounts.models import User


class StaffCreateSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "password",
            "role",
        )

    def validate_role(self, value):

        # Restaurant admin should not create super admin
        restricted_roles = ["super_admin"]

        if value in restricted_roles:
            raise serializers.ValidationError(
                "You cannot create this role."
            )

        return value

    def create(self, validated_data):

        request = self.context.get("request")

        # Get logged-in restaurant admin
        logged_in_user = request.user

        # Create user
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone=validated_data["phone"],
            role=validated_data["role"],
        )

        # Attach same restaurant as admin
        user.restaurant = logged_in_user.owned_restaurant

        user.save()

        return user
    
class StaffListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "role",
            "is_active",
        )

# ==========================================
# STAFF UPDATE SERIALIZER
# ==========================================
class StaffUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "username",
            "email",
        )