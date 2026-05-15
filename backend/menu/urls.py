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
)

urlpatterns = [
    # =====================================================
    # CATEGORY CRUD
    # =====================================================
    path("categories/create/", CreateCategoryView.as_view(), name="create-category"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path(
        "categories/<int:category_id>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),
    path(
        "categories/<int:category_id>/update/",
        UpdateCategoryView.as_view(),
        name="update-category",
    ),
    path(
        "categories/<int:category_id>/delete/",
        DeleteCategoryView.as_view(),
        name="delete-category",
    ),
    path(
        "categories/<int:category_id>/toggle-status/",
        ToggleCategoryStatusView.as_view(),
        name="toggle-category-status",
    ),
    path("products/create/", CreateProductView.as_view(), name="create-product"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<int:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/<int:product_id>/update/", UpdateProductView.as_view(), name="update-product"),
    path("products/<int:product_id>/delete/", DeleteProductView.as_view(), name="delete-product"),
    path("products/<int:product_id>/toggle-status/", ToggleProductStatusView.as_view(), name="toggle-produtc-status"),
]
