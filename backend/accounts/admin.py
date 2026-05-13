from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


# ==========================================
# CUSTOM USER ADMIN
# ==========================================
@admin.register(User)
class CustomUserAdmin(UserAdmin):

    # ==========================================
    # USER LIST PAGE COLUMNS
    # ==========================================
    list_display = (
        "id",
        "username",
        "email",
        "role",
        "phone",
        "restaurant",
        "is_active",
        "is_staff",
    )

    # ==========================================
    # SEARCH BAR
    # ==========================================
    search_fields = (
        "username",
        "email",
        "phone",
    )

    # ==========================================
    # FILTERS
    # ==========================================
    list_filter = (
        "role",
        "is_active",
        "is_staff",
    )

    # ==========================================
    # ORDERING
    # ==========================================
    ordering = ("-id",)

    # ==========================================
    # FIELD GROUPS
    # ==========================================
    fieldsets = (
        (
            "Authentication",
            {
                "fields": (
                    "username",
                    "password",
                )
            },
        ),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "phone",
                )
            },
        ),
        (
            "Restaurant Info",
            {
                "fields": (
                    "restaurant",
                    "role",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                )
            },
        ),
    )
