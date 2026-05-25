from django.shortcuts import render

# Create your views here.
from django.shortcuts import get_object_or_404

from rest_framework.response import Response

from rest_framework.views import APIView

from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateAPIView,
)

from .models import (
    Unit,
    Ingredient,
    Supplier,
    InventoryTransaction,
    Purchase,
    ProductRecipe,
    ComboRecipe,
)

from .serializers import (
    # UNIT
    UnitListSerializer,
    UnitCreateSerializer,
    UnitUpdateSerializer,
    # INGREDIENT
    IngredientListSerializer,
    IngredientCreateSerializer,
    IngredientUpdateSerializer,
    # SUPPLIER
    SupplierListSerializer,
    SupplierCreateSerializer,
    SupplierUpdateSerializer,
    InventoryTransactionListSerializer,
    InventoryTransactionCreateSerializer,
    PurchaseListSerializer,
    PurchaseCreateSerializer,
    PurchaseUpdateSerializer,
    ProductRecipeListSerializer,
    ProductRecipeCreateSerializer,
    ProductRecipeUpdateSerializer,
    ComboRecipeListSerializer,
    ComboRecipeCreateSerializer,
    ComboRecipeUpdateSerializer,
)

from restaurants.permissions import (
    IsRestaurantAdminOrManager,
)


# ==========================================
# UNIT CREATE VIEW
# ==========================================
class UnitCreateView(CreateAPIView):

    serializer_class = UnitCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# UNIT LIST VIEW
# ==========================================
class UnitListView(ListAPIView):

    serializer_class = UnitListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return Unit.objects.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user,
            )
        return Unit.objects.filter(
            restaurant_id=restaurant_id,
            restaurant=self.request.user.restaurant,
        )


# ==========================================
# UNIT DETAIL VIEW
# ==========================================
class UnitDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":
            return Unit.objects.filter(restaurant__owner=self.request.user)
        return Unit.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return UnitUpdateSerializer

        return UnitListSerializer


# ==========================================
# UNIT TOGGLE STATUS VIEW
# ==========================================
class UnitToggleStatusView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def patch(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            unit = get_object_or_404(
                Unit,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            unit = get_object_or_404(
                Unit,
                pk=pk,
                restaurant=request.user.restaurant,
            )
        unit.is_active = not unit.is_active

        unit.save()

        message = (
            "Unit activated successfully."
            if unit.is_active
            else "Unit deactivated successfully."
        )

        return Response({"message": message})


# ==========================================
# UNIT DELETE VIEW
# ==========================================
class UnitDeleteView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            unit = get_object_or_404(
                Unit,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            unit = get_object_or_404(
                Unit,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        unit.delete()

        return Response({"message": "Unit deleted successfully."})


# ==========================================
# INGREDIENT CREATE VIEW
# ==========================================
class IngredientCreateView(CreateAPIView):

    serializer_class = IngredientCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# INGREDIENT LIST VIEW
# ==========================================
class IngredientListView(ListAPIView):

    serializer_class = IngredientListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return Ingredient.objects.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user,
            )
        return Ingredient.objects.filter(
            restaurant_id=restaurant_id,
            restaurant=self.request.user.restaurant,
        )


# ==========================================
# INGREDIENT DETAIL VIEW
# ==========================================
class IngredientDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":
            return Ingredient.objects.filter(restaurant__owner=self.request.user)
        return Ingredient.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return IngredientUpdateSerializer

        return IngredientListSerializer


# ==========================================
# INGREDIENT TOGGLE STATUS VIEW
# ==========================================
class IngredientToggleStatusView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def patch(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            ingredient = get_object_or_404(
                Ingredient,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            ingredient = get_object_or_404(
                Ingredient,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        ingredient.is_active = not ingredient.is_active

        ingredient.save()

        message = (
            "Ingredient activated successfully."
            if ingredient.is_active
            else "Ingredient deactivated successfully."
        )

        return Response({"message": message})


# ==========================================
# INGREDIENT DELETE VIEW
# ==========================================
class IngredientDeleteView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            ingredient = get_object_or_404(
                Ingredient,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            ingredient = get_object_or_404(
                Ingredient,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        ingredient.delete()

        return Response({"message": "Ingredient deleted successfully."})


# ==========================================
# SUPPLIER CREATE VIEW
# ==========================================
class SupplierCreateView(CreateAPIView):

    serializer_class = SupplierCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# SUPPLIER LIST VIEW
# ==========================================
class SupplierListView(ListAPIView):

    serializer_class = SupplierListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return Supplier.objects.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user,
            )
        return Supplier.objects.filter(
            restaurant_id=restaurant_id,
            restaurant=self.request.user.restaurant,
        )


# ==========================================
# SUPPLIER DETAIL VIEW
# ==========================================
class SupplierDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":
            return Supplier.objects.filter(restaurant__owner=self.request.user)
        return Supplier.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return SupplierUpdateSerializer

        return SupplierListSerializer


# ==========================================
# SUPPLIER TOGGLE STATUS VIEW
# ==========================================
class SupplierToggleStatusView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def patch(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            supplier = get_object_or_404(
                Supplier,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            supplier = get_object_or_404(
                Supplier,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        supplier.is_active = not supplier.is_active

        supplier.save()

        message = (
            "Supplier activated successfully."
            if supplier.is_active
            else "Supplier deactivated successfully."
        )

        return Response({"message": message})


# ==========================================
# SUPPLIER DELETE VIEW
# ==========================================
class SupplierDeleteView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            supplier = get_object_or_404(
                Supplier,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            supplier = get_object_or_404(
                Supplier,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        supplier.delete()

        return Response({"message": "Supplier deleted successfully."})


# ==========================================
# INVENTORY TRANSACTION CREATE
# ==========================================
class InventoryTransactionCreateView(CreateAPIView):

    serializer_class = InventoryTransactionCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# INVENTORY TRANSACTION LIST
# ==========================================
class InventoryTransactionListView(ListAPIView):

    serializer_class = InventoryTransactionListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return (
                InventoryTransaction.objects.filter(
                    restaurant_id=restaurant_id,
                    restaurant__owner=self.request.user,
                )
                .select_related(
                    "ingredient",
                    "ingredient__unit",
                )
                .order_by("-created_at")
            )
        return (
            InventoryTransaction.objects.filter(
                restaurant_id=restaurant_id,
                restaurant=self.request.user.restaurant,
            )
            .select_related(
                "ingredient",
                "ingredient__unit",
            )
            .order_by("-created_at")
        )


# ==========================================
# PURCHASE CREATE VIEW
# ==========================================
class PurchaseCreateView(CreateAPIView):

    serializer_class = PurchaseCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# PURCHASE LIST VIEW
# ==========================================
class PurchaseListView(ListAPIView):

    serializer_class = PurchaseListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return (
                Purchase.objects.filter(
                    restaurant_id=restaurant_id,
                    restaurant__owner=self.request.user,
                )
                .select_related("supplier")
                .order_by("-purchase_date")
            )
        return (
            Purchase.objects.filter(
                restaurant_id=restaurant_id,
                restaurant=self.request.user.restaurant,
            )
            .select_related("supplier")
            .order_by("-purchase_date")
        )


# ==========================================
# PURCHASE DETAIL VIEW
# ==========================================
class PurchaseDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":
            return Purchase.objects.filter(restaurant__owner=self.request.user)
        return Purchase.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return PurchaseUpdateSerializer

        return PurchaseListSerializer


# ==========================================
# PURCHASE DELETE VIEW
# ==========================================
class PurchaseDeleteView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            purchase = get_object_or_404(
                Purchase,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            purchase = get_object_or_404(
                Purchase,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        purchase.delete()

        return Response({"message": "Purchase deleted successfully."})


# ==========================================
# PRODUCT RECIPE CREATE VIEW
# ==========================================
class ProductRecipeCreateView(CreateAPIView):

    serializer_class = ProductRecipeCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# PRODUCT RECIPE LIST VIEW
# ==========================================
class ProductRecipeListView(ListAPIView):

    serializer_class = ProductRecipeListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return (
                ProductRecipe.objects.filter(
                    restaurant_id=restaurant_id,
                    restaurant__owner=self.request.user,
                )
                .select_related(
                    "ingredient",
                    "ingredient__unit",
                    "product_variant",
                )
                .order_by("-created_at")
            )
        return (
            ProductRecipe.objects.filter(
                restaurant_id=restaurant_id,
                restaurant=self.request.user.restaurant,
            )
            .select_related(
                "ingredient",
                "ingredient__unit",
                "product_variant",
            )
            .order_by("-created_at")
        )


# ==========================================
# PRODUCT RECIPE DETAIL VIEW
# ==========================================
class ProductRecipeDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":
            return ProductRecipe.objects.filter(restaurant__owner=self.request.user)
        return ProductRecipe.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return ProductRecipeUpdateSerializer

        return ProductRecipeListSerializer


# ==========================================
# PRODUCT RECIPE DELETE VIEW
# ==========================================
class ProductRecipeDeleteView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            recipe = get_object_or_404(
                ProductRecipe,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            recipe = get_object_or_404(
                ProductRecipe,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        recipe.delete()

        return Response({"message": ("Recipe deleted successfully.")})


# ==========================================
# COMBO RECIPE CREATE VIEW
# ==========================================
class ComboRecipeCreateView(CreateAPIView):

    serializer_class = ComboRecipeCreateSerializer

    permission_classes = [IsRestaurantAdminOrManager]


# ==========================================
# COMBO RECIPE LIST VIEW
# ==========================================
class ComboRecipeListView(ListAPIView):

    serializer_class = ComboRecipeListSerializer

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):

        restaurant_id = self.request.GET.get("restaurant_id")
        if self.request.user.role == "restaurant_admin":
            return (
                ComboRecipe.objects.filter(
                    restaurant_id=restaurant_id,
                    restaurant__owner=self.request.user,
                )
                .select_related(
                    "combo",
                    "product_variant",
                )
                .order_by("-created_at")
            )
        return (
            ComboRecipe.objects.filter(
                restaurant_id=restaurant_id,
                restaurant=self.request.user.restaurant,
            )
            .select_related(
                "combo",
                "product_variant",
            )
            .order_by("-created_at")
        )


# ==========================================
# COMBO RECIPE DETAIL VIEW
# ==========================================
class ComboRecipeDetailView(RetrieveUpdateAPIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def get_queryset(self):
        if self.request.user.role == "restaurant_admin":
            return ComboRecipe.objects.filter(restaurant__owner=self.request.user)
        return ComboRecipe.objects.filter(restaurant=self.request.user.restaurant)

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return ComboRecipeUpdateSerializer

        return ComboRecipeListSerializer


# ==========================================
# COMBO RECIPE DELETE VIEW
# ==========================================
class ComboRecipeDeleteView(APIView):

    permission_classes = [IsRestaurantAdminOrManager]

    def delete(self, request, pk):
        if self.request.user.role == "restaurant_admin":
            recipe = get_object_or_404(
                ComboRecipe,
                pk=pk,
                restaurant__owner=request.user,
            )
        elif self.request.user.role == "manager":
            recipe = get_object_or_404(
                ComboRecipe,
                pk=pk,
                restaurant=request.user.restaurant,
            )

        recipe.delete()

        return Response({"message": ("Combo recipe deleted successfully.")})
