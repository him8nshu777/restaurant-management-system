from django.urls import path

from .views import RegisterAPIView, VerifyEmailAPIView, CustomLoginAPIView, ForgotPasswordAPIView, ResetPasswordAPIView, CurrentUserAPIView


urlpatterns = [

    path("register/", RegisterAPIView.as_view(), name="register"),

    path("verify-email/<uidb64>/<token>/", VerifyEmailAPIView.as_view(), name="verify-email"),
    path("login/", CustomLoginAPIView.as_view(), name="login"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordAPIView.as_view(), name="reset-password"),
    path("me/", CurrentUserAPIView.as_view(), name="current-user"),
]