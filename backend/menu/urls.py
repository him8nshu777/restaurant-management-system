# menu/urls.py

from django.urls import path

from .views import (
    CreateCategoryView,
    CategoryListView,
    CategoryDetailView,
    UpdateCategoryView,
    DeleteCategoryView,
    ToggleCategoryStatusView,
    CreateProductView,
    ProductListView,
    ProductDetailView,
    UpdateProductView,
    DeleteProductView,
    ToggleProductStatusView,

    CreateVariantView,
    VariantListView,
    UpdateVariantView,
    DeleteVariantView,
    ToggleVariantStatusView,

    CreateAddonView,
    AddonListView,
    UpdateAddonView,
    DeleteAddonView,
    ToggleAddonStatusView,

    CreateProductAddonView,
    ProductAddonListView,
    DeleteProductAddonView,

    ComboListCreateView,
    ComboDetailView,
    ToggleComboStatusView,

    ComboProductListCreateView,
    ComboProductUpdateView,
    ComboProductDeleteView,

)

urlpatterns = [
    # =====================================================
    # CATEGORY CRUD
    # =====================================================
    path("categories/create/", CreateCategoryView.as_view(), name="create-category"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<int:category_id>/", CategoryDetailView.as_view(), name="category-detail"),
    path("categories/<int:category_id>/update/", UpdateCategoryView.as_view(), name="update-category"),
    path("categories/<int:category_id>/delete/", DeleteCategoryView.as_view(), name="delete-category"),
    path("categories/<int:category_id>/toggle-status/", ToggleCategoryStatusView.as_view(), name="toggle-category-status"),

    path("products/create/", CreateProductView.as_view(), name="create-product"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<int:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/<int:product_id>/update/", UpdateProductView.as_view(), name="update-product"),
    path("products/<int:product_id>/delete/", DeleteProductView.as_view(), name="delete-product"),
    path("products/<int:product_id>/toggle-status/", ToggleProductStatusView.as_view(), name="toggle-produtc-status"),
    # =====================================================
    # VARIANTS
    # =====================================================
    path("variants/create/", CreateVariantView.as_view(), name="create-variants"),
    path("variants/", VariantListView.as_view(), name="variants-list"),
    path("variants/<int:variant_id>/update/", UpdateVariantView.as_view(), name="update-variants"),
    path("variants/<int:variant_id>/delete/", DeleteVariantView.as_view(), name="delete-variants"),
    path("variants/<int:variant_id>/toggle-status/", ToggleVariantStatusView.as_view(), name="toggle-variants-status"),


    # =====================================================
    # ADDONS
    # =====================================================
    path("addons/create/", CreateAddonView.as_view(), name="create-addons"),
    path("addons/", AddonListView.as_view(), name="addons-list"),
    path("addons/<int:addon_id>/update/", UpdateAddonView.as_view(), name="update-addons"),
    path("addons/<int:addon_id>/delete/", DeleteAddonView.as_view(), name="delete-addons"),
    path("addons/<int:addon_id>/toggle-status/", ToggleAddonStatusView.as_view(), name="toggle-addons-status"),

    # =====================================================
    # PRODUCTADDONS
    # =====================================================
    path("product-addons/create/", CreateProductAddonView.as_view(), name="create-product-addon"),
    path("product-addons/", ProductAddonListView.as_view(), name="product-addon-list"),
    path("product-addons/<int:mapping_id>/delete/", DeleteProductAddonView.as_view(), name="delete-product-addon"),
    # path("addons/<int:addon_id>/toggle-status/", ToggleAddonStatusView.as_view(), name="toggle-addons-status"),

    # =========================================================
    # COMBOS
    # =========================================================
    path("combos/", ComboListCreateView.as_view(), name="combo-list-create"),

    path("combos/<int:pk>/", ComboDetailView.as_view(), name="combo-detail"),

    path("combos/<int:pk>/toggle-status/", ToggleComboStatusView.as_view(), name="toggle-combo-status"),

    # =========================================================
    # COMBO PRODUCT MAPPING
    # =========================================================
    path("combo-products/", ComboProductListCreateView.as_view(), name="combo-product-list-create"),
    path("combo-products/<int:pk>/update/", ComboProductUpdateView.as_view(), name="combo-product-update"),
    path("combo-products/<int:pk>/delete/", ComboProductDeleteView.as_view(), name="combo-product-delete"),
]
