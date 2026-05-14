from rest_framework import serializers

from accounts.models import User

from .models import Restaurant, Floor, Area


# ==========================================
# RESTAURANT LIST SERIALIZER
# ==========================================
class RestaurantListSerializer(serializers.ModelSerializer):

    class Meta:

        model = Restaurant

        fields = [
            "id",
            "name",
            "gst_number",
            "address",
            "status",
            "is_primary",
            "created_at",
        ]


# ==========================================
# RESTAURANT UPDATE SERIALIZER
# ==========================================
class RestaurantUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Restaurant

        fields = [
            "id",
            "name",
            "gst_number",
            "address",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "gst_number",
            "status",
            "created_at",
        ]


# ==========================================
# CREATE RESTAURANT SERIALIZER
# ==========================================
class RestaurantCreateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Restaurant

        fields = [
            "name",
            "gst_number",
            "address",
        ]

    def create(self, validated_data):

        request = self.context["request"]

        return Restaurant.objects.create(owner=request.user, **validated_data)


class StaffCreateSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=6)

    # ==========================================
    # ACTIVE RESTAURANT ID
    # ==========================================
    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "password",
            "role",
            "restaurant_id",
        )

    def validate_role(self, value):

        # Restaurant admin should not create super admin
        restricted_roles = ["super_admin"]

        if value in restricted_roles:
            raise serializers.ValidationError("You cannot create this role.")

        return value

    def create(self, validated_data):

        request = self.context.get("request")
        restaurant_id = validated_data.pop("restaurant_id")

        # ==========================================
        # VERIFY RESTAURANT BELONGS TO OWNER
        # ==========================================
        restaurant = Restaurant.objects.get(id=restaurant_id, owner=request.user)

        # ==========================================
        # PENDING BRANCH CANNOT CREATE STAFF
        # ==========================================
        if restaurant.status != "active":

            raise serializers.ValidationError(
                {"restaurant": "Pending restaurants cannot create staff."}
            )

        # Create user
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone=validated_data["phone"],
            role=validated_data["role"],
            restaurant=restaurant,
        )

        user.save()

        return user


class StaffListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "role",
            "is_active",
        )


# ==========================================
# STAFF UPDATE SERIALIZER
# ==========================================
class StaffUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "username",
            "email",
        )


# ==========================================
# FLOOR LIST SERIALIZER
# ==========================================
class FloorListSerializer(serializers.ModelSerializer):

    class Meta:

        model = Floor

        fields = (
            "id",
            "name",
            "floor_number",
            "is_active",
            "created_at",
        )


# ==========================================
# FLOOR CREATE SERIALIZER
# ==========================================
class FloorCreateSerializer(serializers.ModelSerializer):

    # ==========================================
    # ACTIVE RESTAURANT
    # ==========================================
    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:

        model = Floor

        fields = (
            "id",
            "name",
            "floor_number",
            "restaurant_id",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop("restaurant_id")

        # ==========================================
        # VERIFY OWNER RESTAURANT
        # ==========================================
        restaurant = Restaurant.objects.get(id=restaurant_id, owner=request.user)

        # ==========================================
        # CREATE FLOOR
        # ==========================================
        floor = Floor.objects.create(restaurant=restaurant, **validated_data)

        return floor


# ==========================================
# FLOOR UPDATE SERIALIZER
# ==========================================
class FloorUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Floor

        fields = (
            "name",
            "floor_number",
            "is_active",
        )


# ==========================================
# AREA CREATE SERIALIZER
# ==========================================
class AreaCreateSerializer(serializers.ModelSerializer):

    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:

        model = Area

        fields = (
            "id",
            "name",
            "area_type",
            "floor",
            "restaurant_id",
        )

    def create(self, validated_data):

        request = self.context.get("request")

        restaurant_id = validated_data.pop("restaurant_id")

        # ==========================================
        # VERIFY RESTAURANT OWNER
        # ==========================================
        restaurant = Restaurant.objects.get(id=restaurant_id, owner=request.user)

        # ==========================================
        # CREATE AREA
        # ==========================================
        area = Area.objects.create(restaurant=restaurant, **validated_data)

        return area


# ==========================================
# AREA LIST SERIALIZER
# ==========================================
class AreaListSerializer(serializers.ModelSerializer):

    floor_name = serializers.CharField(source="floor.name", read_only=True)

    class Meta:

        model = Area

        fields = (
            "id",
            "name",
            "area_type",
            "floor",
            "floor_name",
            "is_active",
        )


# ==========================================
# AREA UPDATE SERIALIZER
# ==========================================
class AreaUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Area

        fields = (
            "name",
            "area_type",
            "floor",
        )
