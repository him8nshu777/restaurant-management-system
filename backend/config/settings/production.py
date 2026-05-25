from .base import *

DEBUG = True

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
import dj_database_url
import os

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

ALLOWED_HOSTS = ["*"]