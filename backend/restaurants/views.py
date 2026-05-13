from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response

from accounts.models import User

from .permissions import IsRestaurantAdmin
from .serializers import (
    StaffCreateSerializer,
    StaffListSerializer,
    StaffUpdateSerializer,
)


class StaffCreateView(CreateAPIView):
    """
    API for restaurant admin to create staff users.
    """

    serializer_class = StaffCreateSerializer
    permission_classes = [IsRestaurantAdmin]


class StaffListView(ListAPIView):
    """
    List all staff members of restaurant.
    """

    serializer_class = StaffListSerializer
    permission_classes = [IsRestaurantAdmin]

    def get_queryset(self):

        # Get current user's restaurant
        restaurant = self.request.user.restaurant

        # Return only users of same restaurant
        return (
            User.objects.filter(restaurant=restaurant)
            .exclude(role="restaurant_admin")
            .order_by("-id")
        )


class StaffDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update and soft delete staff users.
    """

    permission_classes = [IsRestaurantAdmin]

    def get_queryset(self):

        return User.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        # Use update serializer for PUT/PATCH
        if self.request.method in ["PUT", "PATCH"]:

            return StaffUpdateSerializer

        return StaffListSerializer

    def destroy(self, request, *args, **kwargs):

        staff_user = self.get_object()

        # Toggle active status
        staff_user.is_active = not staff_user.is_active

        staff_user.save()

        # Dynamic response message
        message = (
            "User enabled successfully."
            if staff_user.is_active
            else "User disabled successfully."
        )

        return Response({"message": message}, status=status.HTTP_200_OK)
