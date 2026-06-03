from django.urls import path

from .views import SalesReportView, ProductReportView, TimeAnalysisReportView, KitchenReportView

urlpatterns = [
    path("sales/", SalesReportView.as_view(), name="sales-report",),

    path("products/", ProductReportView.as_view(), name="product-report"),

    path("time-analysis/", TimeAnalysisReportView.as_view(), name="time-analysis-report"),

    path("kitchen/", KitchenReportView.as_view(), name="kitchen-report"),
]