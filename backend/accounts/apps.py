from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'accounts'

# from django.apps import AppConfig


# class AccountsConfig(AppConfig):

#     default_auto_field = (
#         "django.db.models.BigAutoField"
#     )

#     name = "accounts"

#     def ready(self):

#         from django.conf import settings

#         if settings.CREATE_SUPERUSER:

#             from django.contrib.auth import (
#                 get_user_model
#             )

#             User = get_user_model()
#             username="himanshu"
#             email = "himanshuraut@gmail.com"

#             password = "him12421"

#             if not User.objects.filter(
#                 email=email
#             ).exists():

#                 User.objects.create_superuser(
#                     username=username,
#                     email=email,
#                     password=password
#                 )

#                 print(
#                     "Superuser created"
#                 )
