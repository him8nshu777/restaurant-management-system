from django.urls import re_path

from .consumers import UserSessionConsumer, SessionConsumer


websocket_urlpatterns = [

    re_path(
        r"ws/security/(?P<restaurant_id>\d+)/$", UserSessionConsumer.as_asgi(),
 
    ),
    re_path(
        r"ws/security/$", SessionConsumer.as_asgi()
    ),
    
]
