"""
SERIALIZERS MODULE

Purpose:
- Handle user registration logic
- Handle login authentication logic
- Validate and transform API input/output
"""

from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from restaurants.models import Restaurant
from .utils import send_verification_email


# ==========================================
# REGISTER SERIALIZER
# ==========================================
# Handles:
# - User creation
# - Restaurant creation
# - Email verification trigger
# ==========================================
class RegisterSerializer(serializers.Serializer):

    username = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()

    password = serializers.CharField(write_only=True, min_length=8)

    restaurant_name = serializers.CharField()
    gst_number = serializers.CharField()

    @transaction.atomic
    def create(self, validated_data):
        """
        Creates:
        1. User (restaurant admin)
        2. Restaurant linked to user
        3. Sends verification email

        Transaction.atomic ensures:
        → Either both user + restaurant are created
        → OR nothing is saved (prevents partial data)
        """

        # Extract restaurant-specific fields
        restaurant_name = validated_data.pop("restaurant_name")
        gst_number = validated_data.pop("gst_number")

        # Extract password separately (not stored directly)
        password = validated_data.pop("password")

        # Create user instance
        user = User(**validated_data)

        # Assign default role
        user.role = "restaurant_admin"

        # Secure password hashing
        user.set_password(password)

        user.save()

        # Create linked restaurant entry
        Restaurant.objects.create(
            owner=user,
            name=restaurant_name,
            gst_number=gst_number,
            status="pending"  # default onboarding status
        )

        # Send email verification link
        send_verification_email(user)

        return user


# ==========================================
# CUSTOM LOGIN SERIALIZER
# ==========================================
# Handles:
# - Email + password authentication
# - JWT token generation
# - Returning user + restaurant status
# ==========================================
class CustomLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validates login credentials and returns:
        - JWT tokens
        - User data
        - Restaurant status
        """

        email = attrs.get("email")
        password = attrs.get("password")

        # Step 1: Find user by email
        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        # Step 2: Authenticate password
        authenticated_user = authenticate(
            username=user.username,
            password=password
        )

        if not authenticated_user:
            raise serializers.ValidationError("Invalid credentials")

        # Step 3: Get restaurant linked to user
        restaurant = authenticated_user.restaurant

        # Step 4: Block login if email not verified
        if not restaurant.is_email_verified:
            raise serializers.ValidationError("Please verify your email.")

        # Step 5: Generate JWT tokens
        refresh = RefreshToken.for_user(authenticated_user)

        # Step 6: Return response payload
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),

            "user": {
                "id": authenticated_user.id,
                "email": authenticated_user.email,
                "role": authenticated_user.role,

                # Important for frontend routing logic
                "restaurant_status": restaurant.status,
            }
        }