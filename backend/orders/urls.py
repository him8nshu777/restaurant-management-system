from django.urls import path

from .views import (
    CreateOrderView,
    OrderListView,
    UpdateOrderView,
    DeleteOrderView,
)

urlpatterns = [
    path(
        "<int:restaurant_id>/create/",
        CreateOrderView.as_view(),
        name="create-order",
    ),
    path(
        "<int:restaurant_id>/list/",
        OrderListView.as_view(),
        name="order-list",
    ),
    path(
        "<int:order_id>/update/",
        UpdateOrderView.as_view(),
        name="update-order",
    ),
    path(
        "<int:order_id>/delete/",
        DeleteOrderView.as_view(),
        name="delete-order",
    ),
]
