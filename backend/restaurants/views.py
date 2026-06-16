from rest_framework import status
from django.db import transaction
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
from .utils import get_lat_long_from_address
from .permissions import (
    IsRestaurantAdmin,
    IsRestaurantAdminOrManager,
    CanGetStaff,
    CanManageStaff,
)
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
    MergeTableSerializer,
    UnmergeTableSerializer,
)
from audits.services import create_activity_log


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
    # UPDATE RESTAURANT
    # ==========================================
    def perform_update(self, serializer):

        restaurant = serializer.save()

        address = restaurant.address

        if address:

            latitude, longitude = get_lat_long_from_address(address)

            restaurant.latitude = latitude

            restaurant.longitude = longitude

            restaurant.save(
                update_fields=[
                    "latitude",
                    "longitude",
                ]
            )

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
    permission_classes = [CanManageStaff]


class StaffListView(ListAPIView):
    """
    List all staff members of restaurant.
    """

    serializer_class = StaffListSerializer
    permission_classes = [CanGetStaff]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        if self.request.user.role == "restaurant_admin":

            return (
                User.objects.filter(
                    restaurant_id=restaurant_id, restaurant__owner=self.request.user
                )
                .exclude(role="restaurant_admin")
                .order_by("-id")
            )
        return (
            User.objects.filter(
                restaurant_id=restaurant_id,
                restaurant=self.request.user.restaurant,
            )
            .exclude(role="restaurant_admin")
            .order_by("-id")
        )


class StaffDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update and soft delete staff users.
    """

    permission_classes = [CanManageStaff]

    def get_queryset(self):

        # ======================================
        # RESTAURANT ADMIN
        # ======================================
        if self.request.user.role == "restaurant_admin":

            return User.objects.filter(restaurant__owner=self.request.user)

        # ======================================
        # MANAGER
        # ======================================
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


# ==========================================
# FLOOR CREATE VIEW
# ==========================================
class FloorCreateView(CreateAPIView):

    serializer_class = FloorCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# FLOOR LIST VIEW
# ==========================================
class FloorListView(ListAPIView):

    serializer_class = FloorListSerializer

    permission_classes = [CanManageFloor]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        if self.request.user.role == "restaurant_admin":

            return Floor.objects.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user,
            )

        return Floor.objects.filter(
            restaurant_id=restaurant_id,
            restaurant=self.request.user.restaurant,
        )


# ==========================================
# FLOOR DETAIL VIEW
# ==========================================
class FloorDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        # ======================================
        # RESTAURANT ADMIN
        # ======================================
        if self.request.user.role == "restaurant_admin":

            return Floor.objects.filter(restaurant__owner=self.request.user)
        # ======================================
        # MANAGER
        # ======================================
        return Floor.objects.filter(restaurant=self.request.user.restaurant)

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

    permission_classes = [IsRestaurantAdminOrManager]

    def patch(self, request, pk):
        # ======================================
        # RESTAURANT ADMIN
        # ======================================
        if self.request.user.role == "restaurant_admin":

            floor = get_object_or_404(Floor, pk=pk, restaurant__owner=request.user)
        elif self.request.user.role == "manager":
            floor = get_object_or_404(Floor, pk=pk, restaurant=request.user.restaurant)
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

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        # ======================================
        # RESTAURANT ADMIN
        # ======================================
        if self.request.user.role == "restaurant_admin":

            floor = get_object_or_404(Floor, pk=pk, restaurant__owner=request.user)
        elif self.request.user.role == "manager":

            floor = get_object_or_404(Floor, pk=pk, restaurant=request.user.restaurant)

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

    permission_classes = [CanManageFloor]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        if self.request.user.role == "restaurant_admin":

            return Area.objects.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user,
            ).order_by("-id")

        return Area.objects.filter(
            restaurant_id=restaurant_id,
            restaurant=self.request.user.restaurant,
        ).order_by("-id")


# ==========================================
# AREA DETAIL VIEW
# ==========================================
class AreaDetailView(RetrieveUpdateDestroyAPIView):

    permission_classes = [CanManageFloor]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":

            return Area.objects.filter(restaurant__owner=self.request.user)
        return Area.objects.filter(restaurant=self.request.user.restaurant)

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

    permission_classes = [CanManageFloor]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")

        queryset = RestaurantTable.objects.select_related(
            "floor",
            "area",
            "assigned_waiter",
            "merged_into",
        ).prefetch_related("merged_tables")
        if self.request.user.role == "restaurant_admin":

            return queryset.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user,
            )

        return queryset.filter(
            restaurant_id=restaurant_id,
            restaurant=self.request.user.restaurant,
        )

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
        )
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

    permission_classes = [CanManageFloor]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":

            return RestaurantTable.objects.filter(restaurant__owner=self.request.user)
        return RestaurantTable.objects.filter(restaurant=self.request.user.restaurant)

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
        if self.request.user.role == "restaurant_admin":

            table = RestaurantTable.objects.get(pk=pk, restaurant__owner=request.user)
        elif self.request.user.role == "manager":
            table = RestaurantTable.objects.get(
                pk=pk, restaurant=request.user.restaurant
            )

        table.is_active = not table.is_active

        table.save()

        message = (
            "Table activated successfully."
            if table.is_active
            else "Table deactivated successfully."
        )

        return Response({"message": message}, status=status.HTTP_200_OK)


# ==========================================
# MERGE TABLES
# ==========================================
class MergeTableView(APIView):

    @transaction.atomic
    def patch(self, request):

        serializer = MergeTableSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        table_ids = serializer.validated_data["table_ids"]

        tables = RestaurantTable.objects.filter(id__in=table_ids)

        if tables.count() != len(table_ids):

            return Response(
                {"message": "Invalid table selection."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # SAME FLOOR CHECK
        # -------------------------
        floor_ids = set(tables.values_list("floor_id", flat=True))

        if len(floor_ids) > 1:

            return Response(
                {"message": "Cannot merge tables from different floors."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # SAME AREA CHECK
        # -------------------------
        area_ids = set(tables.values_list("area_id", flat=True))

        if len(area_ids) > 1:

            return Response(
                {"message": "Cannot merge tables from different areas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if tables.filter(status="occupied").exists():

            return Response({"message": "Cannot merge occupied tables."}, status=400)
        
        # -------------------------
        # ALREADY PART OF A GROUP
        # -------------------------
        if tables.filter(is_merged=True).exists():

            return Response(
                {
                    "message":
                    "Selected table(s) are already in a merged group. Unmerge them and try again."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # MASTER TABLE CHECK
        # -------------------------
        if tables.filter(
            merged_tables__isnull=False
        ).exists():

            return Response(
                {
                    "message":
                    "One or more selected tables are already master tables of a merged group. Please unmerge them first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        # -------------------------
        # MASTER TABLE
        # -------------------------
        master_table = tables.order_by("id").first()

        merged_table_numbers = [
            table.table_number
            for table in tables
        ]
        # -------------------------
        # MERGE
        # -------------------------
        for table in tables.exclude(id=master_table.id):

            table.is_merged = True

            table.merged_into = master_table

            table.save(
                update_fields=[
                    "is_merged",
                    "merged_into",
                ]
            )
        # -------------------------
        # ACTIVITY LOG
        # -------------------------
        create_activity_log(
            restaurant=master_table.restaurant,
            user=request.user,
            action="table_merged",
            message=(
                f"Merged tables: "
                f"{', '.join(merged_table_numbers)} "
                f"into master table "
                f"{master_table.table_number}"
            ),
        )
        return Response({"message": "Tables merged successfully."})


# ==========================================
# UNMERGE TABLES
# ==========================================
class UnmergeTableView(APIView):

    @transaction.atomic
    def patch(self, request):

        serializer = UnmergeTableSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        master_id = serializer.validated_data["master_table_id"]

        table_ids = serializer.validated_data["table_ids"]

        tables = RestaurantTable.objects.filter(
            id__in=table_ids,
            merged_into_id=master_id,
        )
        master_table = RestaurantTable.objects.get(
            id=master_id
        )

        unmerged_table_numbers = []
        for table in tables:
            
            unmerged_table_numbers.append(
                table.table_number
            )
            table.is_merged = False

            table.merged_into = None

            table.save(
                update_fields=[
                    "is_merged",
                    "merged_into",
                ]
            )

        # -------------------------
        # ACTIVITY LOG
        # -------------------------
        create_activity_log(
            restaurant=master_table.restaurant,
            user=request.user,
            action="table_unmerged",
            message=(
                f"Unmerged tables: "
                f"{', '.join(unmerged_table_numbers)} "
                f"from master table "
                f"{master_table.table_number}"
            ),
        )
        return Response({"message": "Tables unmerged successfully."})
