# menu/views/category_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404

from .models import Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboProduct
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    AddonSerializer,
    ProductAddonSerializer,
    ComboSerializer,
    ComboProductSerializer,

)

from restaurants.models import Restaurant


# =========================================================
# CREATE CATEGORY
# =========================================================
class CreateCategoryView(APIView):

    def post(self, request):

        # =================================================
        # GET ACTIVE RESTAURANT ID
        # =================================================
        restaurant_id = request.data.get("restaurant")

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET RESTAURANT
        # =================================================
        restaurant = get_object_or_404(
            Restaurant,
            id=restaurant_id,
        )

        # =================================================
        # SERIALIZER
        # =================================================
        serializer = CategorySerializer(data=request.data, context={"request": request})

        if serializer.is_valid():

            category = serializer.save(restaurant=restaurant)

            response_serializer = CategorySerializer(
                category,
                context={"request": request},
            )

            return Response(
                {
                    "success": True,
                    "message": "Category created successfully",
                    "data": response_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# CATEGORY LIST
# =========================================================
class CategoryListView(APIView):

    def get(self, request):

        # =================================================
        # GET RESTAURANT ID
        # =================================================
        restaurant_id = request.GET.get("restaurant")

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET CATEGORY LIST
        # =================================================
        categories = Category.objects.filter(restaurant_id=restaurant_id).order_by(
            "name"
        )
        # CategoryListView

        print("REQUEST INSIDE VIEW =>", request)
        serializer = CategorySerializer(
            categories,
            many=True,
            context={"request": request},
        )
        print(serializer.data)
        return Response(
            {
                "success": True,
                "count": categories.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CATEGORY DETAILS
# =========================================================
class CategoryDetailView(APIView):

    def get(self, request, category_id):

        # =================================================
        # GET CATEGORY
        # =================================================
        category = get_object_or_404(
            Category,
            id=category_id,
        )

        serializer = CategorySerializer(
            category,
            context={"request": request},
        )

        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# UPDATE CATEGORY
# =========================================================
class UpdateCategoryView(APIView):

    def put(self, request, category_id):

        # =================================================
        # GET CATEGORY
        # =================================================
        category = get_object_or_404(
            Category,
            id=category_id,
        )

        serializer = CategorySerializer(
            category, data=request.data, partial=True, context={"request": request}
        )

        if serializer.is_valid():

            updated_category = serializer.save()

            response_serializer = CategorySerializer(
                updated_category,
                context={"request": request},
            )

            return Response(
                {
                    "success": True,
                    "message": "Category updated successfully",
                    "data": response_serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# DELETE CATEGORY
# =========================================================
class DeleteCategoryView(APIView):

    def delete(self, request, category_id):

        # =================================================
        # GET CATEGORY
        # =================================================
        category = get_object_or_404(
            Category,
            id=category_id,
        )

        category.delete()

        return Response(
            {
                "success": True,
                "message": "Category deleted successfully",
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# TOGGLE CATEGORY STATUS
# =========================================================
class ToggleCategoryStatusView(APIView):

    def patch(self, request, category_id):

        # =================================================
        # GET CATEGORY
        # =================================================
        category = get_object_or_404(
            Category,
            id=category_id,
        )

        # =================================================
        # TOGGLE STATUS
        # =================================================
        category.is_active = not category.is_active

        category.save()

        return Response(
            {
                "success": True,
                "message": "Category status updated successfully",
                "is_active": category.is_active,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CREATE PRODUCT
# =========================================================
class CreateProductView(APIView):

    def post(self, request):

        restaurant_id = request.data.get("restaurant")

        category_id = request.data.get("category")

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not category_id:

            return Response(
                {
                    "success": False,
                    "message": "Category ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        restaurant = get_object_or_404(
            Restaurant,
            id=restaurant_id,
        )

        category = get_object_or_404(
            Category,
            id=category_id,
            restaurant=restaurant,
        )

        serializer = ProductSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():

            product = serializer.save(
                restaurant=restaurant,
                category=category,
            )

            response_serializer = ProductSerializer(
                product,
                context={"request": request},
            )

            return Response(
                {
                    "success": True,
                    "message": "Product created successfully",
                    "data": response_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# PRODUCT LIST
# =========================================================
class ProductListView(APIView):

    def get(self, request):

        restaurant_id = request.GET.get("restaurant")

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        products = (
            Product.objects.filter(restaurant_id=restaurant_id)
            .select_related("category")
            .order_by("name")
        )

        serializer = ProductSerializer(
            products,
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "success": True,
                "count": products.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# PRODUCT DETAILS
# =========================================================
class ProductDetailView(APIView):

    def get(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        serializer = ProductSerializer(
            product,
            context={"request": request},
        )

        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# UPDATE PRODUCT
# =========================================================
class UpdateProductView(APIView):

    def put(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():

            updated_product = serializer.save()

            response_serializer = ProductSerializer(
                updated_product,
                context={"request": request},
            )

            return Response(
                {
                    "success": True,
                    "message": "Product updated successfully",
                    "data": response_serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# DELETE PRODUCT
# =========================================================
class DeleteProductView(APIView):

    def delete(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        product.delete()

        return Response(
            {
                "success": True,
                "message": "Product deleted successfully",
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# TOGGLE PRODUCT STATUS
# =========================================================
class ToggleProductStatusView(APIView):

    def patch(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        product.is_available = not product.is_available

        product.save()

        return Response(
            {
                "success": True,
                "message": "Product status updated successfully",
                "is_available": product.is_available,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        product.is_available = not product.is_available

        product.save()

        return Response(
            {
                "success": True,
                "message": "Product status updated successfully",
                "is_available": product.is_available,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CREATE VARIANT
# =========================================================
class CreateVariantView(APIView):

    def post(self, request):

        restaurant_id = request.data.get("restaurant")

        restaurant = get_object_or_404(
            Restaurant,
            id=restaurant_id,
        )

        serializer = ProductVariantSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save(restaurant=restaurant)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# VARIANT LIST
# =========================================================
class VariantListView(APIView):

    def get(self, request):

        restaurant_id = request.GET.get("restaurant")

        variants = ProductVariant.objects.filter(restaurant_id=restaurant_id)

        serializer = ProductVariantSerializer(
            variants,
            many=True,
        )

        return Response(serializer.data)


# =========================================================
# UPDATE VARIANT
# =========================================================
class UpdateVariantView(APIView):

    def put(
        self,
        request,
        variant_id,
    ):

        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
        )

        serializer = ProductVariantSerializer(
            variant,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# DELETE VARIANT
# =========================================================
class DeleteVariantView(APIView):

    def delete(
        self,
        request,
        variant_id,
    ):

        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
        )

        variant.delete()

        return Response({"message": "Variant deleted successfully"})


# =========================================================
# TOGGLE STATUS
# =========================================================
class ToggleVariantStatusView(APIView):

    def patch(
        self,
        request,
        variant_id,
    ):

        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
        )

        variant.is_available = not variant.is_available

        variant.save()

        return Response({"is_available": variant.is_available})


# =========================================================
# CREATE ADDON
# =========================================================
class CreateAddonView(APIView):

    def post(self, request):

        # =================================================
        # GET RESTAURANT ID
        # =================================================
        restaurant_id = request.data.get("restaurant")

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET RESTAURANT
        # =================================================
        restaurant = get_object_or_404(
            Restaurant,
            id=restaurant_id,
        )

        # =================================================
        # SERIALIZER
        # =================================================
        serializer = AddonSerializer(data=request.data)

        if serializer.is_valid():

            addon = serializer.save(restaurant=restaurant)

            return Response(
                {
                    "success": True,
                    "message": "Addon created successfully",
                    "data": AddonSerializer(addon).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# ADDON LIST
# =========================================================
class AddonListView(APIView):

    def get(self, request):

        # =================================================
        # GET RESTAURANT ID
        # =================================================
        restaurant_id = request.GET.get("restaurant")

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET ADDON LIST
        # =================================================
        addons = Addon.objects.filter(restaurant_id=restaurant_id).order_by("name")

        serializer = AddonSerializer(
            addons,
            many=True,
        )

        return Response(
            {
                "success": True,
                "count": addons.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# UPDATE ADDON
# =========================================================
class UpdateAddonView(APIView):

    def put(self, request, addon_id):

        # =================================================
        # GET ADDON
        # =================================================
        addon = get_object_or_404(
            Addon,
            id=addon_id,
        )

        serializer = AddonSerializer(
            addon,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Addon updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# DELETE ADDON
# =========================================================
class DeleteAddonView(APIView):

    def delete(self, request, addon_id):

        addon = get_object_or_404(
            Addon,
            id=addon_id,
        )

        addon.delete()

        return Response(
            {
                "success": True,
                "message": "Addon deleted successfully",
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# TOGGLE ADDON STATUS
# =========================================================
class ToggleAddonStatusView(APIView):

    def patch(self, request, addon_id):

        addon = get_object_or_404(
            Addon,
            id=addon_id,
        )

        addon.is_active = not addon.is_active

        addon.save()

        return Response(
            {
                "success": True,
                "message": "Addon status updated successfully",
                "is_active": addon.is_active,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CREATE PRODUCT ADDON MAPPING
# =========================================================
class CreateProductAddonView(APIView):

    def post(self, request):

        # =================================================
        # GET DATA
        # =================================================
        product_id = request.data.get("product")

        addon_id = request.data.get("addon")

        # =================================================
        # VALIDATION
        # =================================================
        if not product_id or not addon_id:

            return Response(
                {
                    "success": False,
                    "message": "Product and Addon are required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET OBJECTS
        # =================================================
        product = get_object_or_404(
            Product,
            id=product_id,
        )

        addon = get_object_or_404(
            Addon,
            id=addon_id,
        )

        # =================================================
        # SAME RESTAURANT VALIDATION
        # =================================================
        if product.restaurant_id != addon.restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Product and Addon must belong to same restaurant",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # PREVENT DUPLICATE
        # =================================================
        if ProductAddon.objects.filter(
            product=product,
            addon=addon,
        ).exists():

            return Response(
                {
                    "success": False,
                    "message": "Addon already mapped to product",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # CREATE MAPPING
        # =================================================
        mapping = ProductAddon.objects.create(
            product=product,
            addon=addon,
        )

        serializer = ProductAddonSerializer(mapping)

        return Response(
            {
                "success": True,
                "message": "Addon mapped successfully",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

# =========================================================
# PRODUCT ADDON LIST
# =========================================================
class ProductAddonListView(APIView):

    def get(self, request):

        restaurant_id = request.GET.get(
            "restaurant"
        )

        if not restaurant_id:

            return Response(
                {
                    "success": False,
                    "message": "Restaurant ID is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        mappings = ProductAddon.objects.filter(
            product__restaurant_id=restaurant_id
        ).select_related(
            "product",
            "addon",
        )

        serializer = ProductAddonSerializer(
            mappings,
            many=True,
        )

        return Response(
            {
                "success": True,
                "count": mappings.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    
    
# =========================================================
# DELETE PRODUCT ADDON MAPPING
# =========================================================
class DeleteProductAddonView(APIView):

    def delete(self, request, mapping_id):

        # =================================================
        # GET MAPPING
        # =================================================
        mapping = get_object_or_404(
            ProductAddon,
            id=mapping_id,
        )

        mapping.delete()

        return Response(
            {
                "success": True,
                "message": "Addon removed from product",
            },
            status=status.HTTP_200_OK,
        )

# =========================================================
# COMBO LIST CREATE VIEW
# =========================================================
class ComboListCreateView(APIView):

    def get(self, request):

        restaurant_id = request.GET.get(
            "restaurant"
        )

        combos = Combo.objects.filter(
            restaurant_id=restaurant_id
        )

        serializer = ComboSerializer(
            combos,
            many=True,
            context={
        "request": request,
    },
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = ComboSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# COMBO DETAIL VIEW
# =========================================================
class ComboDetailView(APIView):

    def put(self, request, pk):

        combo = get_object_or_404(
            Combo,
            pk=pk,
        )

        serializer = ComboSerializer(
            combo,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):

        combo = get_object_or_404(
            Combo,
            pk=pk,
        )

        combo.delete()

        return Response(
            {
                "message": "Combo deleted"
            },
            status=status.HTTP_204_NO_CONTENT,
        )


# =========================================================
# TOGGLE COMBO STATUS
# =========================================================
class ToggleComboStatusView(APIView):

    def patch(self, request, pk):

        combo = get_object_or_404(
            Combo,
            pk=pk,
        )

        combo.is_active = not combo.is_active

        combo.save()

        return Response(
            {
                "success": True,
                "is_active": combo.is_active,
            }
        )

# =========================================================
# COMBO PRODUCT LIST CREATE
# =========================================================
class ComboProductListCreateView(APIView):

    def get(self, request):

        restaurant_id = request.GET.get(
            "restaurant"
        )

        mappings = ComboProduct.objects.filter(
            combo__restaurant_id=restaurant_id
        ).select_related(
            "combo",
            "product",
        )

        serializer = ComboProductSerializer(
            mappings,
            many=True,
        )

        return Response(
            {
                "success": True,
                "data": serializer.data,
            }
        )

    def post(self, request):

        combo = request.data.get("combo")

        product = request.data.get("product")

        # ============================================
        # CHECK DUPLICATE
        # ============================================
        exists = ComboProduct.objects.filter(
            combo=combo,
            product=product,
        ).exists()

        if exists:

            return Response(
                {
                    "success": False,
                    "message": "This product is already mapped to the combo.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ComboProductSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Product mapped successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# UPDATE COMBO PRODUCT
# =========================================================
class ComboProductUpdateView(APIView):

    def patch(self, request, pk):

        mapping = get_object_or_404(
            ComboProduct,
            pk=pk,
        )

        serializer = ComboProductSerializer(
            mapping,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Mapping updated successfully",
                    "data": serializer.data,
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

# =========================================================
# DELETE COMBO PRODUCT
# =========================================================
class ComboProductDeleteView(APIView):

    def delete(self, request, pk):

        mapping = get_object_or_404(
            ComboProduct,
            pk=pk,
        )

        mapping.delete()

        return Response(
            {
                "message": "Mapping removed"
            },
            status=status.HTTP_204_NO_CONTENT,
        )