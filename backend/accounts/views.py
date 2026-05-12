from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer
from django.utils.http import urlsafe_base64_decode


from django.contrib.auth.tokens import default_token_generator

from restaurants.models import Restaurant

from .models import User
from .utils import send_password_reset_email
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomLoginSerializer
from rest_framework.permissions import IsAuthenticated

class RegisterAPIView(APIView):

    permission_classes = [
        AllowAny
    ]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message":
                    "Restaurant admin registered successfully",

                "user_id":
                    user.id,
            },
            status=status.HTTP_201_CREATED
        )
    

class CustomLoginAPIView(TokenObtainPairView):

    serializer_class = CustomLoginSerializer

class VerifyEmailAPIView(APIView):

    permission_classes = [
        AllowAny
    ]

    def get(self,
        request,
        uidb64,
        token
    ):

        try:

            uid =urlsafe_base64_decode(
                    uidb64
                ).decode()

            user =User.objects.get(pk=uid)

        except Exception:

            return Response(
                {
                    "message":
                    "Invalid Link"
                },
                status=400
            )

        if (
            default_token_generator.check_token(
                user,
                token
            )
        ):

            restaurant = user.restaurant

            restaurant.is_email_verified = True

            restaurant.save()

            return Response(
                {
                    "message":
                    "Email Verified"
                }
            )

        return Response(
            {
                "message":
                "Invalid Token"
            },
            status=400
        )
    
class ForgotPasswordAPIView(
    APIView
):

    permission_classes = [
        AllowAny
    ]

    def post(self, request):

        email =request.data.get("email")

        try:

            user = User.objects.get(
                    email=email
                )
            send_password_reset_email(user)

        except User.DoesNotExist:

            return Response(
        {
            "message":
            "Email not registered"
        },
        status=404
    )

        return Response({
            "message":
            "Password reset link sent"
        })

class ResetPasswordAPIView(APIView):

    permission_classes = [AllowAny]
 
    def post(self,request,uidb64,token):

        password =request.data.get("password")

        try:

            uid =urlsafe_base64_decode(uidb64).decode()

            user =User.objects.get(pk=uid)

        except Exception:

            return Response(
                {
                    "message":
                    "Invalid link"
                },
                status=400
            )

        if not (
            default_token_generator.check_token(
                user,
                token
            )
        ):

            return Response(
                {
                    "message":
                    "Invalid token"
                },
                status=400
            )

        user.set_password(password)

        user.save()

        return Response({
            "message":
            "Password reset successful"
        })
    
class CurrentUserAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        restaurant = user.restaurant

        return Response({

            "id": user.id,

            "email": user.email,

            "role": user.role,

            "restaurant_status":
                restaurant.status,
        })