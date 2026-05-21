# pos/urls.py
from django.urls import path
from .views import (POSDashboardView)

urlpatterns = [
    path("products/", POSDashboardView.as_view()),
]