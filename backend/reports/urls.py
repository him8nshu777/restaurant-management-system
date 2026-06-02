from django.urls import path

from .views import SalesReportView, ProductReportView

urlpatterns = [
    path("sales/", SalesReportView.as_view(), name="sales-report",),

    path("products/", ProductReportView.as_view(), name="product-report"),
]