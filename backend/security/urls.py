from django.urls import path

from .views import (
    UserSessionListView,
    logout_selected_device,
    logout_all_devices,
)

urlpatterns = [

    # ==========================================
    # ACTIVE DEVICES
    # GET /security/sessions/1/
    # ==========================================
    path("<int:restaurant_id>/", UserSessionListView.as_view(), name="user-sessions"),

    # ==========================================
    # LOGOUT SINGLE DEVICE
    # POST /security/logout-device/
    # ==========================================
    path("logout-device/", logout_selected_device, name="logout-device"),

    # ==========================================
    # LOGOUT ALL DEVICES
    # POST /security/logout-all-devices/
    # ==========================================
    path("logout-all-devices/", logout_all_devices, name="logout-all-devices"),
]