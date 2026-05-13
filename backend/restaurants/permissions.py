from rest_framework.permissions import BasePermission


class IsRestaurantAdmin(BasePermission):

    """
    Allows access only to restaurant admins.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role == "restaurant_admin"
        )