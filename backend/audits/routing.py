from django.urls import re_path

from .consumers import (
    AuditLogConsumer,
)

websocket_urlpatterns = [
    re_path(
        r"ws/audit/(?P<restaurant_id>\d+)/$",
        AuditLogConsumer.as_asgi(),
    ),
]