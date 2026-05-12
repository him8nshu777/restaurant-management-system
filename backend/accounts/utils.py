from django.contrib.auth.tokens import (default_token_generator)
from django.utils.encoding import (force_bytes)
from django.utils.http import (urlsafe_base64_encode)
from django.core.mail import send_mail

from django.conf import settings

def generate_email_token(user):

    uid = urlsafe_base64_encode(force_bytes(user.pk))

    token = default_token_generator.make_token(user)

    return uid, token

def send_verification_email(user):

    uid, token = generate_email_token(user)

    verify_url = (
        f"{settings.FRONTEND_URL}/"
        f"verify-email/"
        f"{uid}/{token}"
    )

    send_mail(
        subject="Verify Your RMS Account",

        message=
        f"Click here to verify your email:\n"
        f"{verify_url}",

        from_email=settings.EMAIL_HOST_USER,

        recipient_list=[user.email],
    )

def send_restaurant_status_email(
    user,
    status
):

    subject = ""

    message = ""

    if status == "active":

        subject = (
            "Restaurant Approved"
        )

        message = (
            f"Hello {user.username},\n\n"
            "Your restaurant has been approved.\n"
            "You can now login and use RMS."
        )

    elif status == "rejected":

        subject = (
            "Restaurant Rejected"
        )

        message = (
            f"Hello {user.username},\n\n"
            "Your restaurant registration "
            "was rejected."
        )

    elif status == "suspended":

        subject = (
            "Restaurant Suspended"
        )

        message = (
            f"Hello {user.username},\n\n"
            "Your restaurant account "
            "has been suspended."
        )

    else:
        subject = (
            "Restaurant Pending"
        )

        message = (
            f"Hello {user.username},\n\n"
            "Your restaurant registration is currently pending review.\n"
            "We will notify you once the verification process is completed."
        )

    send_mail(
        subject=subject,

        message=message,

        from_email=
            settings.EMAIL_HOST_USER,

        recipient_list=[
            user.email
        ],
    )

def send_password_reset_email(user):

    uid = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token =default_token_generator.make_token(user)

    reset_url = (
        f"{settings.FRONTEND_URL}/"
        f"reset-password/"
        f"{uid}/{token}"
    )

    send_mail(
        subject="Reset Your Password",

        message=
        f"Click here to reset password:\n"
        f"{reset_url}",

        from_email=
            settings.EMAIL_HOST_USER,

        recipient_list=[
            user.email
        ],
    )