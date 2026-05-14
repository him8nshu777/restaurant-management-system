from django.urls import path

from .views import (
    RestaurantListView,
    RestaurantDetailView,
    RestaurantCreateView,
    StaffCreateView,
    StaffListView,
    StaffDetailView,
    FloorCreateView,
    FloorDetailView,
    FloorListView,
    FloorToggleStatusView,
    FloorDeleteView,

    AreaCreateView,
    AreaListView,
    AreaDetailView,

    AreaDeleteView,
    AreaToggleStatusView
)

urlpatterns = [
    path("my-restaurants/", RestaurantListView.as_view(), name="my-restaurants"),
    path(
        "my-restaurants/<int:pk>/",
        RestaurantDetailView.as_view(),
        name="restaurant-detail",
    ),
    path(
        "my-restaurants/create/",
        RestaurantCreateView.as_view(),
        name="restaurant-create",
    ),
    path("staff/create/", StaffCreateView.as_view(), name="staff-create"),
    path("staff/", StaffListView.as_view(), name="staff-list"),
    path("staff/<int:pk>/", StaffDetailView.as_view(), name="staff-detail"),
    # ==========================================
    # FLOOR CRUD
    # ==========================================
    path("floors/create/", FloorCreateView.as_view(), name="floor-create"),
    path("floors/", FloorListView.as_view(), name="floor-list"),
    path("floors/<int:pk>/", FloorDetailView.as_view(), name="floor-detail"),
    path("floors/<int:pk>/", FloorDetailView.as_view(), name="floor-detail"),
    # ACTIVE / INACTIVE
    path("floors/<int:pk>/toggle-status/", FloorToggleStatusView.as_view(), name="floor-toggle-status"),
    # DELETE
    path("floors/<int:pk>/delete/", FloorDeleteView.as_view(), name="floor-delete"),
    # ==========================================
    # AREA MANAGEMENT
    # ==========================================
    path("areas/create/", AreaCreateView.as_view(), name="area-create"),
    path("areas/", AreaListView.as_view(), name="area-list"),
    path("areas/<int:pk>/", AreaDetailView.as_view(), name="area-detail"),
    path("areas/<int:pk>/toggle-status/", AreaToggleStatusView.as_view(), name="area-toggle-status"),
    path("areas/<int:pk>/delete/", AreaDeleteView.as_view(), name="area-delete"),
]
