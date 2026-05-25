import resend

from django.conf import settings

from django.contrib.auth.tokens import (
    default_token_generator
)

from django.utils.encoding import (
    force_bytes
)

from django.utils.http import (
    urlsafe_base64_encode
)

resend.api_key = settings.RESEND_API_KEY


def generate_email_token(user):

    uid = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = (
        default_token_generator
        .make_token(user)
    )

    return uid, token


def send_email(
    to_email,
    subject,
    html_content
):

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    })


def send_verification_email(user):

    uid, token = generate_email_token(user)

    verify_url = (
        f"{settings.FRONTEND_URL}/"
        f"verify-email/"
        f"{uid}/{token}"
    )

    html = f"""
    <h2>Verify Your RMS Account</h2>

    <p>
        Click the button below to verify your email.
    </p>

    <a href="{verify_url}">
        Verify Email
    </a>
    """

    send_email(
        user.email,
        "Verify Your RMS Account",
        html
    )


def send_restaurant_status_email(
    user,
    status
):

    if status == "active":

        subject = "Restaurant Approved"

        html = f"""
        <h2>Restaurant Approved</h2>

        <p>
            Hello {user.username},
        </p>

        <p>
            Your restaurant has been approved.
        </p>
        """

    elif status == "rejected":

        subject = "Restaurant Rejected"

        html = f"""
        <h2>Restaurant Rejected</h2>

        <p>
            Hello {user.username},
        </p>

        <p>
            Your restaurant registration was rejected.
        </p>
        """

    elif status == "suspended":

        subject = "Restaurant Suspended"

        html = f"""
        <h2>Restaurant Suspended</h2>

        <p>
            Hello {user.username},
        </p>

        <p>
            Your account has been suspended.
        </p>
        """

    else:

        subject = "Restaurant Pending"

        html = f"""
        <h2>Restaurant Pending</h2>

        <p>
            Hello {user.username},
        </p>

        <p>
            Your registration is pending review.
        </p>
        """

    send_email(
        user.email,
        subject,
        html
    )


def send_password_reset_email(user):

    uid = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = (
        default_token_generator
        .make_token(user)
    )

    reset_url = (
        f"{settings.FRONTEND_URL}/"
        f"reset-password/"
        f"{uid}/{token}"
    )

    html = f"""
    <h2>Reset Password</h2>

    <p>
        Click below to reset your password.
    </p>

    <a href="{reset_url}">
        Reset Password
    </a>
    """

    send_email(
        user.email,
        "Reset Your Password",
        html
    )