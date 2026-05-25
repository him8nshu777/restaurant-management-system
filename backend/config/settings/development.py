from .base import *

DEBUG = True

FRONTEND_URL = env("FRONTEND_URL")
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
# =========================================================
# MEDIA CONFIGURATION
# =========================================================
MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
    }
}
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": (
            "channels_redis.core.RedisChannelLayer"
        ),
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}