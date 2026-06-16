from django.urls import path

from .views import (
    CreateOrderView,
    OrderListView,
    UpdateOrderView,
    DeleteOrderView,
    UpdateOrderStatusView,
    AcceptDeliveryOrderView,
    UpdateDeliveryStatusView,
    UpdatePaymentStatusView,

    PrintInvoiceView,
    TransferTableView
)

urlpatterns = [
    path("<int:restaurant_id>/create/", CreateOrderView.as_view(), name="create-order"),
    path("<int:restaurant_id>/list/", OrderListView.as_view(), name="order-list"),
    path("<int:order_id>/update/", UpdateOrderView.as_view(), name="update-order"),
    path("<int:order_id>/status/", UpdateOrderStatusView.as_view(), name="update-order-status"),
    path("<int:order_id>/delete/", DeleteOrderView.as_view(), name="delete-order"),
    path("<int:order_id>/accept-delivery/", AcceptDeliveryOrderView.as_view(), name="accept-delivery-order"),
    path("<int:order_id>/delivery-status/", UpdateDeliveryStatusView.as_view(), name="update-delivery-status"),
    path("<int:order_id>/payment/", UpdatePaymentStatusView.as_view(), name="update-payment-status"),

    path("<int:order_id>/invoice/", PrintInvoiceView.as_view(), name="print-bill"),

    path("<int:order_id>/transfer-table/", TransferTableView.as_view(), name="transfer-table"),
]
