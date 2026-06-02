from django.urls import path

from .views import SalesReportView, ProductReportView, TimeAnalysisReportView

urlpatterns = [
    path("sales/", SalesReportView.as_view(), name="sales-report",),

    path("products/", ProductReportView.as_view(), name="product-report"),

     path("time-analysis/", TimeAnalysisReportView.as_view(), name="time-analysis-report"),
]