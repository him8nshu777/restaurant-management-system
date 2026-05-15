from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
    DestroyAPIView,
    UpdateAPIView,
)
from rest_framework.response import Response

from accounts.models import User

from .permissions import IsRestaurantAdmin, IsRestaurantAdminOrManager
from .serializers import (
    StaffCreateSerializer,
    StaffListSerializer,
    StaffUpdateSerializer,
)

from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from .models import Restaurant, Floor, Area, RestaurantTable

from .serializers import (
    RestaurantListSerializer,
    RestaurantUpdateSerializer,
    RestaurantCreateSerializer,
)
from .serializers import (
    FloorListSerializer,
    FloorCreateSerializer,
    FloorUpdateSerializer,
)
from .permissions import CanManageFloor
from rest_framework.exceptions import ValidationError
from .serializers import AreaCreateSerializer, AreaListSerializer, AreaUpdateSerializer

from .serializers import (
    TableCreateSerializer,
    TableListSerializer,
    TableUpdateSerializer,
)


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


# ==========================================
# FLOOR CREATE VIEW
# ==========================================
class FloorCreateView(CreateAPIView):

    serializer_class = FloorCreateSerializer

    permission_classes = [CanManageFloor]


# ==========================================
# FLOOR LIST VIEW
# ==========================================
class FloorListView(ListAPIView):

    serializer_class = FloorListSerializer

    permission_classes = [CanManageFloor]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        return Floor.objects.filter(
            restaurant_id=restaurant_id, restaurant__owner=self.request.user
        )


# ==========================================
# FLOOR DETAIL VIEW
# ==========================================
class FloorDetailView(RetrieveUpdateAPIView):

    permission_classes = [CanManageFloor]

    def get_queryset(self):

        return Floor.objects.filter(restaurant__owner=self.request.user)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return FloorUpdateSerializer

        return FloorListSerializer


# ==========================================
# FLOOR ACTIVE / INACTIVE
# ==========================================
class FloorToggleStatusView(APIView):

    permission_classes = [CanManageFloor]

    def patch(self, request, pk):

        floor = get_object_or_404(Floor, pk=pk, restaurant__owner=request.user)

        floor.is_active = not floor.is_active

        floor.save()

        message = (
            "Floor activated successfully."
            if floor.is_active
            else "Floor deactivated successfully."
        )

        return Response({"message": message})


# ==========================================
# FLOOR DELETE VIEW
# ==========================================
class FloorDeleteView(APIView):

    permission_classes = [CanManageFloor]

    def delete(self, request, pk):

        floor = get_object_or_404(Floor, pk=pk, restaurant__owner=request.user)

        floor.delete()

        return Response({"message": "Floor deleted successfully."})


# ==========================================
# AREA CREATE VIEW
# ==========================================
class AreaCreateView(CreateAPIView):

    serializer_class = AreaCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# AREA LIST VIEW
# ==========================================
class AreaListView(ListAPIView):

    serializer_class = AreaListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        return Area.objects.filter(
            restaurant_id=restaurant_id, restaurant__owner=self.request.user
        ).order_by("-id")


# ==========================================
# AREA DETAIL VIEW
# ==========================================
class AreaDetailView(RetrieveUpdateDestroyAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        return Area.objects.filter(restaurant__owner=self.request.user)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return AreaUpdateSerializer

        return AreaListSerializer

    # ==========================================
    # ACTIVE / INACTIVE
    # ==========================================
    def destroy(self, request, *args, **kwargs):

        area = self.get_object()

        area.is_active = not area.is_active

        area.save()

        message = (
            "Area activated successfully."
            if area.is_active
            else "Area deactivated successfully."
        )

        return Response({"message": message}, status=status.HTTP_200_OK)


# ==========================================
# AREA TOGGLE STATUS VIEW
# ==========================================
class AreaToggleStatusView(UpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    queryset = Area.objects.all()

    def patch(self, request, *args, **kwargs):

        area = self.get_object()

        area.is_active = not area.is_active

        area.save()

        message = (
            "Area activated successfully."
            if area.is_active
            else "Area deactivated successfully."
        )

        return Response({"message": message}, status=status.HTTP_200_OK)


# ==========================================
# AREA DELETE VIEW
# ==========================================
class AreaDeleteView(DestroyAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    queryset = Area.objects.all()


# ==========================================
# TABLE CREATE VIEW
# ==========================================
class TableCreateView(CreateAPIView):

    serializer_class = TableCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# TABLE LIST VIEW
# ==========================================
class TableListView(ListAPIView):

    serializer_class = TableListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        return RestaurantTable.objects.filter(
            restaurant_id=restaurant_id, restaurant__owner=self.request.user
        ).order_by("table_number")

    # ==========================================
    # OVERRIDE LIST RESPONSE
    # ==========================================
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        tables = self.get_serializer(queryset, many=True).data

        restaurant_id = request.GET.get("restaurant_id")

        waiters = User.objects.filter(
            role="waiter",
            is_active=True,
            restaurant_id=restaurant_id,
        ).distinct()
        print("w->", waiters)
        waiter_data = [
            {
                "id": w.id,
                "username": w.username,
                "is_active": w.is_active,
            }
            for w in waiters
        ]
        print("wai", waiter_data)
        return Response({"tables": tables, "waiters": waiter_data})


# ==========================================
# TABLE DETAIL VIEW
# ==========================================
class TableDetailView(RetrieveUpdateDestroyAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        return RestaurantTable.objects.filter(restaurant__owner=self.request.user)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return TableUpdateSerializer

        return TableListSerializer


# ==========================================
# TOGGLE TABLE STATUS
# ==========================================
class ToggleTableStatusView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def patch(self, request, pk):

        table = RestaurantTable.objects.get(pk=pk, restaurant__owner=request.user)

        table.is_active = not table.is_active

        table.save()

        message = (
            "Table activated successfully."
            if table.is_active
            else "Table deactivated successfully."
        )

        return Response({"message": message}, status=status.HTTP_200_OK)
