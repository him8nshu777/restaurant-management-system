from .base import *

DEBUG = True

FRONTEND_URL = env("FRONTEND_URL")

# =========================================================
# MEDIA CONFIGURATION
# =========================================================
MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"