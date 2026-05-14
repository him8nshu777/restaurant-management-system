from rest_framework.permissions import BasePermission

from .constants import (

    STAFF_ACCESS_ROLES,

    FLOOR_ACCESS_ROLES,
)


# ==========================================
# STAFF MANAGEMENT PERMISSION
# ==========================================
class CanManageStaff(BasePermission):

    """
    Allow only staff management roles.
    """

    def has_permission(self, request, view):

        return (

            request.user.is_authenticated

            and

            request.user.role in STAFF_ACCESS_ROLES
        )



# ==========================================
# FLOOR MANAGEMENT PERMISSION
# ==========================================
class CanManageFloor(BasePermission):

    """
    Allow only floor management roles.
    """

    def has_permission(self, request, view):

        return (

            request.user.is_authenticated

            and

            request.user.role in FLOOR_ACCESS_ROLES
        )



# ==========================================
# RESTAURANT ADMIN ONLY
# ==========================================
class IsRestaurantAdmin(BasePermission):

    """
    Allow only restaurant admin.
    """

    def has_permission(self, request, view):

        return (

            request.user.is_authenticated

            and

            request.user.role == "restaurant_admin"
        )
    
# ==========================================
# OWNER OR MANAGER ACCESS
# ==========================================
class IsRestaurantAdminOrManager(
    BasePermission
):

    """
    Allows access to:
    - restaurant_admin
    - manager
    """

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and request.user.role in [
                "restaurant_admin",
                "manager",
            ]
        )