from rest_framework import serializers


# ==========================================
# NEARBY RESTAURANT SERIALIZER
# ==========================================
class NearbyRestaurantSerializer(
    serializers.Serializer
):

    id = serializers.IntegerField(
        source="restaurant.id"
    )

    name = serializers.CharField(
        source="restaurant.name"
    )

    address = serializers.CharField(
        source="restaurant.address"
    )

    latitude = serializers.DecimalField(
        source="restaurant.latitude",
        max_digits=9,
        decimal_places=6,
        allow_null=True,
    )

    longitude = serializers.DecimalField(
        source="restaurant.longitude",
        max_digits=9,
        decimal_places=6,
        allow_null=True,
    )

    distance = serializers.FloatField()