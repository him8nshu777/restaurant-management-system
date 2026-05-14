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

from rest_framework.permissions import IsAuthenticated

from .models import Restaurant

from .serializers import (
    RestaurantListSerializer,
    RestaurantUpdateSerializer,
    RestaurantCreateSerializer,
)
from rest_framework.exceptions import ValidationError


# ==========================================
# LIST OWNER RESTAURANTS
# ==========================================
class RestaurantListView(ListAPIView):

    serializer_class = RestaurantListSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        # Return all restaurants owned by user
        return Restaurant.objects.filter(owner=self.request.user)


# ==========================================
# UPDATE / DELETE RESTAURANT
# ==========================================
class RestaurantDetailView(RetrieveUpdateDestroyAPIView):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        # Only allow owner restaurants
        return Restaurant.objects.filter(owner=self.request.user)

    def get_serializer_class(self):

        # Update serializer
        if self.request.method in ["PUT", "PATCH"]:

            return RestaurantUpdateSerializer

        return RestaurantListSerializer

    # ==========================================
    # PREVENT PRIMARY RESTAURANT DELETE
    # ==========================================
    def destroy(self, request, *args, **kwargs):

        restaurant = self.get_object()

        # Block primary restaurant deletion
        if restaurant.is_primary:

            raise ValidationError({"detail": "Primary restaurant cannot be deleted."})

        restaurant.delete()

        return Response({"message": "Restaurant deleted successfully."})


# ==========================================
# CREATE NEW BRANCH
# ==========================================
class RestaurantCreateView(CreateAPIView):

    serializer_class = RestaurantCreateSerializer

    def get_queryset(self):

        return Restaurant.objects.filter(owner=self.request.user)


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

        restaurant_id = self.request.GET.get("restaurant_id")

        return (
            User.objects.filter(
                restaurant_id=restaurant_id, restaurant__owner=self.request.user
            )
            .exclude(role="restaurant_admin")
            .order_by("-id")
        )


class StaffDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update and soft delete staff users.
    """

    permission_classes = [IsRestaurantAdmin]

    def get_queryset(self):

        # return User.objects.filter(restaurant=self.request.user.restaurant)
        return User.objects.filter(restaurant__owner=self.request.user)

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
