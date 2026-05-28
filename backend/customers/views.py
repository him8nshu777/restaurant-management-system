from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone

from accounts.models import CustomerAddress
from math import radians, cos, sin, asin, sqrt
from rest_framework.permissions import AllowAny

from restaurants.models import Restaurant

from .serializers import NearbyRestaurantSerializer


# ==========================================
# UPDATE CUSTOMER LOCATION API
# ==========================================
class UpdateCustomerLocationAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request):

        # ======================================
        # CURRENT USER
        # ======================================
        user = request.user

        # ======================================
        # ONLY CUSTOMER ALLOWED
        # ======================================
        if user.role != "customer":

            return Response({"message": "Only customers allowed"}, status=403)

        # ======================================
        # REQUEST DATA
        # ======================================
        latitude = request.data.get("latitude")

        longitude = request.data.get("longitude")

        # ======================================
        # VALIDATION
        # ======================================
        if latitude is None or longitude is None:

            return Response({"message": "Latitude and longitude required"}, status=400)

        # ======================================
        # GET DEFAULT ADDRESS
        # ======================================
        address = CustomerAddress.objects.filter(customer=user, is_default=True).first()

        # ======================================
        # CREATE ADDRESS IF NOT EXISTS
        # ======================================
        if not address:

            address = CustomerAddress.objects.create(
                customer=user,
                label="Current Location",
                address_line_1="Current Location",
                city="Unknown",
                state="Unknown",
                pincode="000000",
                is_default=True,
            )

        # ======================================
        # UPDATE LOCATION
        # ======================================
        address.latitude = latitude

        address.longitude = longitude

        address.location_updated_at = timezone.now()

        address.save(
            update_fields=[
                "latitude",
                "longitude",
                "location_updated_at",
            ]
        )

        return Response({"message": "Location updated successfully"})


# ==========================================
# CALCULATE DISTANCE
# ==========================================
def calculate_distance(lat1, lon1, lat2, lon2):

    # ======================================
    # EARTH RADIUS
    # ======================================
    earth_radius = 6371

    # ======================================
    # CONVERT TO RADIANS
    # ======================================
    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))

    # ======================================
    # DIFFERENCE
    # ======================================
    dlon = lon2 - lon1

    dlat = lat2 - lat1

    # ======================================
    # HAVERSINE FORMULA
    # ======================================
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2

    c = 2 * asin(sqrt(a))

    return round(earth_radius * c, 2)


# ==========================================
# NEARBY RESTAURANTS API
# ==========================================
class NearbyRestaurantsAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        latitude = request.GET.get("latitude")

        longitude = request.GET.get("longitude")

        restaurants = Restaurant.objects.filter(
            status="active",
            latitude__isnull=False,
            longitude__isnull=False,
        )

        results = []

        for restaurant in restaurants:

            distance = calculate_distance(
                latitude,
                longitude,
                restaurant.latitude,
                restaurant.longitude,
            )
            if distance <= 20:
                results.append(
                    {
                        "restaurant": restaurant,
                        "distance": distance,
                    }
                )

        results.sort(key=lambda x: x["distance"])

        serializer = NearbyRestaurantSerializer(results, many=True)

        return Response(serializer.data)
