# ==========================================
# ROLE CONSTANTS
# ==========================================
ROLE_SUPER_ADMIN = "super_admin"

ROLE_RESTAURANT_ADMIN = "restaurant_admin"

ROLE_MANAGER = "manager"

ROLE_CASHIER = "cashier"

ROLE_WAITER = "waiter"

ROLE_KITCHEN = "kitchen"

ROLE_DELIVERY = "delivery"



# ==========================================
# STAFF MANAGEMENT ACCESS
# ==========================================
STAFF_ACCESS_ROLES = [

    ROLE_RESTAURANT_ADMIN,

    ROLE_MANAGER,
]



# ==========================================
# FLOOR MANAGEMENT ACCESS
# ==========================================
FLOOR_ACCESS_ROLES = [

    ROLE_RESTAURANT_ADMIN,

    ROLE_MANAGER,
]



# ==========================================
# TABLE MANAGEMENT ACCESS
# ==========================================
TABLE_ACCESS_ROLES = [

    ROLE_RESTAURANT_ADMIN,

    ROLE_MANAGER,
]



# ==========================================
# BILLING ACCESS
# ==========================================
BILLING_ACCESS_ROLES = [

    ROLE_RESTAURANT_ADMIN,

    ROLE_MANAGER,

    ROLE_CASHIER,
]



# ==========================================
# ORDER ACCESS
# ==========================================
ORDER_ACCESS_ROLES = [

    ROLE_RESTAURANT_ADMIN,

    ROLE_MANAGER,

    ROLE_WAITER,
]