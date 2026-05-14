from django.urls import path

from .views import RestaurantListView, RestaurantDetailView, RestaurantCreateView, StaffCreateView, StaffListView, StaffDetailView

urlpatterns = [
    path("my-restaurants/", RestaurantListView.as_view(), name="my-restaurants"),
    path("my-restaurants/<int:pk>/", RestaurantDetailView.as_view(), name="restaurant-detail"),
    path("my-restaurants/create/", RestaurantCreateView.as_view(), name="restaurant-create"),

    path("staff/create/", StaffCreateView.as_view(), name="staff-create"),
    path("staff/", StaffListView.as_view(), name="staff-list"),
    path("staff/<int:pk>/", StaffDetailView.as_view(), name="staff-detail"),
]
