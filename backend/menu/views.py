# menu/views/category_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

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

            category = serializer.save(
                restaurant=restaurant
            )

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
        categories = Category.objects.filter(
            restaurant_id=restaurant_id
        ).order_by("name")
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

        serializer = CategorySerializer(category, context={"request": request},)

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
            category,
            data=request.data,
            partial=True,
            context={"request": request}
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

        products = Product.objects.filter(
            restaurant_id=restaurant_id
        ).select_related(
            "category"
        ).order_by("name")

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