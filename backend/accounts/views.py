"""
AUTHENTICATION & ACCOUNT VIEWS

Purpose:
- Handle restaurant owner registration
- Handle login authentication
- Handle email verification
- Handle forgot/reset password flow
- Return authenticated user details

Architecture:
Frontend (React)
    ↓
API Views (this file)
    ↓
Serializers / Models
    ↓
Database

Security:
- Uses JWT authentication
- Email verification required
- Password reset token validation
"""

# DRF base API view
from rest_framework.views import APIView

# Standard API response object
from rest_framework.response import Response

# HTTP status codes
from rest_framework import status

# Permission classes
from rest_framework.permissions import AllowAny, IsAuthenticated

# JWT login view
from rest_framework_simplejwt.views import TokenObtainPairView

# Django utilities
from django.utils.http import urlsafe_base64_decode

from django.contrib.auth.tokens import default_token_generator

# Application imports
from .serializers import RegisterSerializer, CustomLoginSerializer

from .models import User

from restaurants.models import Restaurant

from .utils import send_password_reset_email


# ==========================================
# REGISTER API
# ==========================================
# PURPOSE:
# Registers restaurant owner account
#
# FLOW:
# Frontend Form
# → Serializer Validation
# → Create User
# → Create Restaurant
# → Send Verification Email
# ==========================================
class RegisterAPIView(APIView):

    # Public endpoint
    permission_classes = [AllowAny]

    def post(self, request):

        # Validate incoming request data
        serializer = RegisterSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        # Create user + restaurant
        user = serializer.save()

        # Return success response
        return Response(
            {
                "message": "Restaurant admin registered successfully",
                "user_id": user.id,
            },
            status=status.HTTP_201_CREATED,
        )


# ==========================================
# LOGIN API
# ==========================================
# PURPOSE:
# Authenticates user using:
# - Email
# - Password
#
# RETURNS:
# - Access token
# - Refresh token
# - User details
# - Restaurant status
# ==========================================
class CustomLoginAPIView(TokenObtainPairView):

    serializer_class = CustomLoginSerializer


# ==========================================
# EMAIL VERIFICATION API
# ==========================================
# PURPOSE:
# Verifies restaurant owner's email
#
# FLOW:
# Email Link Click
# → Decode user id
# → Validate token
# → Mark email verified
# ==========================================
class VerifyEmailAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):

        try:

            # Decode user id from URL
            uid = urlsafe_base64_decode(uidb64).decode()

            # Find user
            user = User.objects.get(pk=uid)

        except Exception:

            return Response({"message": "Invalid Link"}, status=400)

        # Validate verification token
        if default_token_generator.check_token(user, token):

            # Get linked restaurant
            restaurant = user.restaurant

            # Mark email verified
            restaurant.is_email_verified = True

            restaurant.save()

            return Response({"message": "Email Verified"})

        # Invalid token response
        return Response({"message": "Invalid Token"}, status=400)


# ==========================================
# FORGOT PASSWORD API
# ==========================================
# PURPOSE:
# Sends password reset email
#
# FLOW:
# User enters email
# → Check if account exists
# → Send reset email
# ==========================================
class ForgotPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        # Get email from request body
        email = request.data.get("email")

        try:

            # Find user by email
            user = User.objects.get(email=email)

            # Send password reset email
            send_password_reset_email(user)

        except User.DoesNotExist:

            return Response({"message": "Email not registered"}, status=404)

        return Response({"message": "Password reset link sent"})


# ==========================================
# RESET PASSWORD API
# ==========================================
# PURPOSE:
# Resets password using secure token
#
# FLOW:
# User clicks email link
# → Validate token
# → Set new password
# ==========================================
class ResetPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):

        # New password from frontend
        password = request.data.get("password")

        try:

            # Decode user id
            uid = urlsafe_base64_decode(uidb64).decode()

            # Find user
            user = User.objects.get(pk=uid)

        except Exception:

            return Response({"message": "Invalid link"}, status=400)

        # Validate password reset token
        if not (default_token_generator.check_token(user, token)):

            return Response({"message": "Invalid token"}, status=400)

        # Hash and save new password
        user.set_password(password)

        user.save()

        return Response({"message": "Password reset successful"})


# ==========================================
# CURRENT USER API
# ==========================================
# PURPOSE:
# Returns authenticated user details
#
# Used By:
# - ProtectedRoute
# - HomePage
# - AccountStatusPage
#
# IMPORTANT:
# Frontend uses this API to always get
# latest restaurant status from backend
# ==========================================
class CurrentUserAPIView(APIView):

    # Only logged-in users allowed
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Currently authenticated user
        user = request.user

        # Restaurant linked to user
        restaurant = user.restaurant

        # Return user data
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                # Used for frontend route control
                "restaurant_status": restaurant.status,
            }
        )
