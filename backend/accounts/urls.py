from django.urls import path

from .views import RegisterAPIView, VerifyEmailAPIView, CustomLoginAPIView, ForgotPasswordAPIView, ResetPasswordAPIView, CurrentUserAPIView, CustomerRegisterAPIView, CustomerLoginAPIView, ProfileView, UserAddressListCreateView, UserAddressDetailView, LogoutAPIView


urlpatterns = [

    path("register/", RegisterAPIView.as_view(), name="register"),
    path("customer/register/", CustomerRegisterAPIView.as_view(), name="customer-register"),
    path("verify-email/<uidb64>/<token>/", VerifyEmailAPIView.as_view(), name="verify-email"),
    path("login/", CustomLoginAPIView.as_view(), name="login"),
    path("customer/login/",CustomerLoginAPIView.as_view(), name="customer-login"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordAPIView.as_view(), name="reset-password"),
    path("me/", CurrentUserAPIView.as_view(), name="current-user"),

    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/addresses/", UserAddressListCreateView.as_view(), name="profile-address"),
    path("profile/addresses/<int:pk>/", UserAddressDetailView.as_view(), name="profile-address-update"),

    path("logout/", LogoutAPIView.as_view(), name="logout"),

]