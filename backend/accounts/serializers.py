from rest_framework import serializers

from django.db import transaction

from .models import User

from restaurants.models import Restaurant
from .utils import send_verification_email
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken


class RegisterSerializer(serializers.Serializer):

    username = serializers.CharField()

    email = serializers.EmailField()

    phone = serializers.CharField()

    password = serializers.CharField(write_only=True, min_length=8)

    restaurant_name = serializers.CharField()

    gst_number = serializers.CharField()


    @transaction.atomic
    def create(self, validated_data):

        restaurant_name = validated_data.pop(
                "restaurant_name"
            )

        gst_number = validated_data.pop(
                "gst_number"
            )

        password = validated_data.pop(
                "password"
            )

        user = User(
            **validated_data
        )

        user.role = "restaurant_admin"

        user.set_password(password)

        user.save()

        Restaurant.objects.create(
            owner=user,
            name=restaurant_name,
            gst_number=gst_number,
            status="pending"
        )

        send_verification_email(user)

        return user
    


class CustomLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs.get("email")

        password = attrs.get("password")

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                "Invalid credentials"
            )

        authenticated_user = authenticate(
            username=user.username,
            password=password
        )

        if not authenticated_user:

            raise serializers.ValidationError(
                "Invalid credentials"
            )

        restaurant = authenticated_user.restaurant

        if (
            not restaurant.is_email_verified
        ):

            raise serializers.ValidationError(
                "Please verify your email."
            )

        refresh = RefreshToken.for_user(
                authenticated_user
            )

        return {

            "refresh": str(refresh),

            "access":
                str(refresh.access_token),

            "user": {

                "id":
                    authenticated_user.id,

                "email":
                    authenticated_user.email,

                "role":
                    authenticated_user.role,

                "restaurant_status":
                    restaurant.status,
            }
        }
    