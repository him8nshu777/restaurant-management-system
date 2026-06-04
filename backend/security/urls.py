from django.urls import path

from .views import UserSessionListView

urlpatterns = [
    path("<int:restaurant_id>/", UserSessionListView.as_view(), name="user-sessions"),
]