from django.urls import re_path

from .consumers import (
    KitchenConsumer,
    WaiterConsumer,
    DeliveryConsumer
)

websocket_urlpatterns = [

    re_path(
        r"ws/kitchen/(?P<restaurant_id>\d+)/$",
        KitchenConsumer.as_asgi(),
    ),

    re_path(
        r"ws/waiter/(?P<waiter_id>\d+)/$",
        WaiterConsumer.as_asgi(),
    ),
    # =====================================
    # DELIVERY
    # =====================================
    re_path(
        r"ws/delivery/(?P<restaurant_id>\d+)/$",
        DeliveryConsumer.as_asgi(),
    ),
]