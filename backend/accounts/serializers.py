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

from .models import (
    User,
    UserProfile,
    StaffProfile,
    DeliveryProfile,
    CustomerProfile,
    UserAddress,
)
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
            status="pending",  # default onboarding status
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
# CUSTOMER REGISTER SERIALIZER
# ==========================================
class CustomerRegisterSerializer(serializers.Serializer):

    username = serializers.CharField()

    email = serializers.EmailField()

    phone = serializers.CharField()

    password = serializers.CharField(write_only=True, min_length=8)

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User(**validated_data)

        user.role = "customer"

        user.set_password(password)

        user.save()
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

            raise serializers.ValidationError("Invalid credentials")

        # ==========================================
        # CHECK PASSWORD MANUALLY
        # ==========================================
        if not user.check_password(password):

            raise serializers.ValidationError("Invalid credentials")

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
        authenticated_user = authenticate(username=user.username, password=password)

        # ==========================================
        # GET RESTAURANT
        # ==========================================
        restaurant = authenticated_user.restaurant

        if not restaurant:

            raise serializers.ValidationError("Restaurant not found.")

        # ==========================================
        # EMAIL VERIFICATION CHECK
        # ==========================================
        if not restaurant.is_email_verified:

            raise serializers.ValidationError("Restaurant email is not verified.")

        # ==========================================
        # JWT TOKEN GENERATION
        # ==========================================
        refresh = RefreshToken.for_user(authenticated_user)

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
                "restaurant_id": restaurant.id,
            },
        }


class CustomerLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(write_only=True)

    def validate(self, attrs):

        email = attrs.get("email")

        password = attrs.get("password")

        try:

            user = User.objects.get(email=email, role="customer")

        except User.DoesNotExist:

            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):

            raise serializers.ValidationError("Invalid credentials")

        if not user.is_email_verified:

            raise serializers.ValidationError("Email is not verified.")
        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
        }


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile

        fields = [
            "date_of_birth",
            "gender",
            "alternate_phone",
            "emergency_contact_name",
            "emergency_contact_phone",
        ]


class StaffProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = StaffProfile

        fields = [
            "employee_id",
            "joining_date",
            "salary",
            "is_active_staff",
            "notes",
        ]


class DeliveryProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeliveryProfile

        fields = [
            "vehicle_type",
            "vehicle_number",
            "driving_license_number",
            "is_available",
        ]


class CustomerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerProfile

        fields = [
            "loyalty_points",
            "total_orders",
            "total_spent",
            "last_order_date",
        ]


class UserAddressSerializer(serializers.ModelSerializer):

    class Meta:

        model = UserAddress

        fields = [
            "id",
            "label",
            "address_line_1",
            "address_line_2",
            "landmark",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "is_default",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class ProfileSerializer(serializers.ModelSerializer):

    profile = UserProfileSerializer(read_only=True)

    staff_profile = StaffProfileSerializer(read_only=True)

    delivery_profile = DeliveryProfileSerializer(read_only=True)

    customer_profile = CustomerProfileSerializer(read_only=True)

    addresses = UserAddressSerializer(many=True, read_only=True)

    class Meta:

        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
            "profile",
            "staff_profile",
            "delivery_profile",
            "customer_profile",
            "addresses",
        ]


class ProfileUpdateSerializer(serializers.Serializer):

    first_name = serializers.CharField(required=False)

    last_name = serializers.CharField(required=False)

    date_of_birth = serializers.DateField(required=False, allow_null=True)

    gender = serializers.CharField(required=False, allow_blank=True)

    alternate_phone = serializers.CharField(required=False, allow_blank=True)

    emergency_contact_name = serializers.CharField(required=False, allow_blank=True)

    emergency_contact_phone = serializers.CharField(required=False, allow_blank=True)

    # delivery only

    vehicle_type = serializers.CharField(required=False, allow_blank=True)

    vehicle_number = serializers.CharField(required=False, allow_blank=True)

    driving_license_number = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):

        user = self.instance

        if user.role == "delivery":

            vehicle_type = attrs.get("vehicle_type")

            vehicle_number = attrs.get("vehicle_number")

            if vehicle_type is not None and not vehicle_type:
                raise serializers.ValidationError(
                    {"vehicle_type": "Vehicle type cannot be blank."}
                )

            if vehicle_number is not None and not vehicle_number:
                raise serializers.ValidationError(
                    {"vehicle_number": "Vehicle number cannot be blank."}
                )

        return attrs

    def update(self, instance, validated_data):

        # --------------------------------
        # USER
        # --------------------------------

        if "first_name" in validated_data:

            instance.first_name = validated_data["first_name"]

        if "last_name" in validated_data:

            instance.last_name = validated_data["last_name"]

        instance.save()

        # --------------------------------
        # USER PROFILE
        # --------------------------------

        profile, _ = UserProfile.objects.get_or_create(user=instance)

        profile.date_of_birth = validated_data.get(
            "date_of_birth", profile.date_of_birth
        )

        profile.gender = validated_data.get("gender", profile.gender)

        profile.alternate_phone = validated_data.get(
            "alternate_phone", profile.alternate_phone
        )

        profile.emergency_contact_name = validated_data.get(
            "emergency_contact_name", profile.emergency_contact_name
        )

        profile.emergency_contact_phone = validated_data.get(
            "emergency_contact_phone", profile.emergency_contact_phone
        )

        profile.save()

        # --------------------------------
        # DELIVERY PROFILE
        # --------------------------------

        if instance.role == "delivery":

            delivery, _ = DeliveryProfile.objects.get_or_create(
                user=instance, defaults={"vehicle_type": "bike", "vehicle_number": ""}
            )

            if "vehicle_type" in validated_data:

                delivery.vehicle_type = validated_data["vehicle_type"]

            if "vehicle_number" in validated_data:

                delivery.vehicle_number = validated_data["vehicle_number"]

            if "driving_license_number" in validated_data:

                delivery.driving_license_number = validated_data[
                    "driving_license_number"
                ]

            delivery.save()

        return instance
