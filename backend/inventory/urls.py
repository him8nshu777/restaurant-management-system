from django.urls import path

from .views import (
    # UNIT
    UnitCreateView,
    UnitListView,
    UnitDetailView,
    UnitToggleStatusView,
    UnitDeleteView,
    # INGREDIENT
    IngredientCreateView,
    IngredientListView,
    IngredientDetailView,
    IngredientToggleStatusView,
    IngredientDeleteView,
    # SUPPLIER
    SupplierCreateView,
    SupplierListView,
    SupplierDetailView,
    SupplierToggleStatusView,
    SupplierDeleteView,
    InventoryTransactionListView,
    InventoryTransactionCreateView,
    PurchaseCreateView,
    PurchaseListView,
    PurchaseDetailView,
    PurchaseDeleteView,

    ProductRecipeCreateView,
    ProductRecipeListView,
    ProductRecipeDetailView,
    ProductRecipeDeleteView,

    ComboRecipeCreateView,
    ComboRecipeListView,
    ComboRecipeDetailView,
    ComboRecipeDeleteView,

)

urlpatterns = [
    # ==========================================
    # UNIT URLS
    # ==========================================
    path("units/create/", UnitCreateView.as_view(), name="unit-create"),
    path("units/", UnitListView.as_view(), name="unit-list"),
    path("units/<int:pk>/", UnitDetailView.as_view(), name="unit-detail"),
    path(
        "units/<int:pk>/toggle-status/",
        UnitToggleStatusView.as_view(),
        name="unit-toggle-status",
    ),
    path(
        "units/<int:pk>/delete/",
        UnitDeleteView.as_view(),
        name="unit-delete",
    ),
    # ==========================================
    # INGREDIENT URLS
    # ==========================================
    path(
        "ingredients/create/",
        IngredientCreateView.as_view(),
        name="ingredient-create",
    ),
    path(
        "ingredients/",
        IngredientListView.as_view(),
        name="ingredient-list",
    ),
    path(
        "ingredients/<int:pk>/",
        IngredientDetailView.as_view(),
        name="ingredient-detail",
    ),
    path(
        "ingredients/<int:pk>/toggle-status/",
        IngredientToggleStatusView.as_view(),
        name="ingredient-toggle-status",
    ),
    path(
        "ingredients/<int:pk>/delete/",
        IngredientDeleteView.as_view(),
        name="ingredient-delete",
    ),
    # ==========================================
    # SUPPLIER URLS
    # ==========================================
    path(
        "suppliers/create/",
        SupplierCreateView.as_view(),
        name="supplier-create",
    ),
    path(
        "suppliers/",
        SupplierListView.as_view(),
        name="supplier-list",
    ),
    path(
        "suppliers/<int:pk>/",
        SupplierDetailView.as_view(),
        name="supplier-detail",
    ),
    path(
        "suppliers/<int:pk>/toggle-status/",
        SupplierToggleStatusView.as_view(),
        name="supplier-toggle-status",
    ),
    path(
        "suppliers/<int:pk>/delete/",
        SupplierDeleteView.as_view(),
        name="supplier-delete",
    ),
    # ==========================================
    # INVENTORY TRANSACTIONS
    # ==========================================
    path(
        "inventory-transactions/create/",
        InventoryTransactionCreateView.as_view(),
        name="inventory-transaction-create",
    ),
    path(
        "inventory-transactions/",
        InventoryTransactionListView.as_view(),
        name="inventory-transaction-list",
    ),
    # ==========================================
    # PURCHASES
    # ==========================================
    path(
        "purchases/create/",
        PurchaseCreateView.as_view(),
        name="purchase-create",
    ),
    path(
        "purchases/",
        PurchaseListView.as_view(),
        name="purchase-list",
    ),
    path(
        "purchases/<int:pk>/",
        PurchaseDetailView.as_view(),
        name="purchase-detail",
    ),
    path(
        "purchases/<int:pk>/delete/",
        PurchaseDeleteView.as_view(),
        name="purchase-delete",
    ),
    # ==========================================
    # PRODUCT RECIPES
    # ==========================================
    path(
        "product-recipes/create/",
        ProductRecipeCreateView.as_view(),
        name="product-recipe-create",
    ),
    path(
        "product-recipes/",
        ProductRecipeListView.as_view(),
        name="product-recipe-list",
    ),
    path(
        "product-recipes/<int:pk>/",
        ProductRecipeDetailView.as_view(),
        name="product-recipe-detail",
    ),
    path(
        "product-recipes/<int:pk>/delete/",
        ProductRecipeDeleteView.as_view(),
        name="product-recipe-delete",
    ),
    # ==========================================
    # COMBO RECIPES
    # ==========================================
    path(
        "combo-recipes/create/",
        ComboRecipeCreateView.as_view(),
        name="combo-recipe-create",
    ),
    path(
        "combo-recipes/",
        ComboRecipeListView.as_view(),
        name="combo-recipe-list",
    ),
    path(
        "combo-recipes/<int:pk>/",
        ComboRecipeDetailView.as_view(),
        name="combo-recipe-detail",
    ),
    path(
        "combo-recipes/<int:pk>/delete/",
        ComboRecipeDeleteView.as_view(),
        name="combo-recipe-delete",
    ),
]
