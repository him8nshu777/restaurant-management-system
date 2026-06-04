from django.urls import re_path

from .consumers import UserSessionConsumer


websocket_urlpatterns = [

    re_path(
        r"ws/security/(?P<restaurant_id>\d+)/$",
        UserSessionConsumer.as_asgi(),
    ),
]