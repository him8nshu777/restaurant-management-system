from django.contrib import admin

from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "id",
        "username",
        "email",
        "phone",
        "role",
        "is_staff",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "RMS Information",
            {
                "fields": (
                    "phone",
                    "role",
                )
            },
        ),
    )