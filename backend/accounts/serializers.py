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
        2. Restaurant
        3. Links user to restaurant
        4. Sends verification email

        Transaction.atomic ensures:
        → Either both user + restaurant are created
        → OR nothing is saved (prevents partial data)
        """

        # Extract restaurant-specific fields
        restaurant_name = validated_data.pop("restaurant_name")
        gst_number = validated_data.pop("gst_number")

        # Extract password separately (not stored directly)
        password = validated_data.pop("password")

        # ==========================================
        # Create restaurant admin user
        # ==========================================
        
        # Create user instance
        user = User(**validated_data)

        # Assign default role
        user.role = "restaurant_admin"

        # Secure password hashing
        user.set_password(password)

        user.save()

        # Create linked restaurant entry
        restaurant = Restaurant.objects.create(
            owner=user,
            name=restaurant_name,
            gst_number=gst_number,
            is_primary=True,
            status="pending"  # default onboarding status
        )
        # ==========================================
        # Link owner to restaurant
        # IMPORTANT:
        # Needed for request.user.restaurant
        # ==========================================

        user.restaurant = restaurant

        user.save(update_fields=["restaurant"])

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

        email = attrs.get("email")
        password = attrs.get("password")

        # ==========================================
        # FIND USER BY EMAIL
        # ==========================================
        try:

            user = User.objects.get(email=email)

        except User.DoesNotExist:

            raise serializers.ValidationError(
                "Invalid credentials"
            )

        # ==========================================
        # CHECK PASSWORD MANUALLY
        # ==========================================
        if not user.check_password(password):

            raise serializers.ValidationError(
                "Invalid credentials"
            )
        
        # ==========================================
        # BLOCK DISABLED USERS
        # ==========================================
        if not user.is_active:

            raise serializers.ValidationError(
                "Your account has been disabled. Contact administrator."
            )


        # ==========================================
        # AUTHENTICATE USER
        # ==========================================
        authenticated_user = authenticate(
            username=user.username,
            password=password
        )



        # ==========================================
        # GET RESTAURANT
        # ==========================================
        restaurant = authenticated_user.restaurant

        if not restaurant:

            raise serializers.ValidationError(
                "Restaurant not found."
            )



        # ==========================================
        # EMAIL VERIFICATION CHECK
        # ==========================================
        if not restaurant.is_email_verified:

            raise serializers.ValidationError(
                "Restaurant email is not verified."
            )



        # ==========================================
        # JWT TOKEN GENERATION
        # ==========================================
        refresh = RefreshToken.for_user(
            authenticated_user
        )



        # ==========================================
        # RETURN RESPONSE
        # ==========================================
        return {

            "refresh": str(refresh),

            "access": str(refresh.access_token),

            "user": {

                "id": authenticated_user.id,

                "email": authenticated_user.email,

                "role": authenticated_user.role,

                "restaurant_status": restaurant.status,
            }
        }