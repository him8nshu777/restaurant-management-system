from django.urls import path

from .views import (
    ActivityLogListView,
)

urlpatterns = [
    path("restaurants/<int:restaurant_id>/activity-logs/", ActivityLogListView.as_view(), name="activity-logs"),
]
