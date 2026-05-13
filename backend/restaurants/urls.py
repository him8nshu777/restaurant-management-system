from django.urls import path

from .views import StaffCreateView, StaffListView, StaffDetailView

urlpatterns = [
    path("staff/create/", StaffCreateView.as_view(), name="staff-create"),
    path("staff/", StaffListView.as_view(), name="staff-list"),
    path("staff/<int:pk>/", StaffDetailView.as_view(), name="staff-detail"),
]
