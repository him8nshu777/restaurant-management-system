from .base import *
import dj_database_url
import os
DEBUG = False

FRONTEND_URL = env("FRONTEND_URL")

# =========================================================
# MEDIA CONFIGURATION
# =========================================================
MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": (
            "channels_redis.core.RedisChannelLayer"
        ),
        "CONFIG": {
            "hosts": [os.environ.get("REDIS_URL")],
        },
    },
}


DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get("DATABASE_URL")
    )
}
STATIC_ROOT = BASE_DIR / "staticfiles"  

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ALLOWED_HOSTS = ["restaurant-management-system-gfjs.onrender.com"]
CORS_ALLOWED_ORIGINS = [
    "https://restaurant-management-system-sigma-six.vercel.app",
]
CSRF_TRUSTED_ORIGINS = [
    "https://restaurant-management-system-sigma-six.vercel.app",
]

RESEND_API_KEY = env("RESEND_API_KEY")

CREATE_SUPERUSER = env.bool(
    "CREATE_SUPERUSER",
    default=False
)