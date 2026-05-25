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
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}