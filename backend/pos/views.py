# pos/views.py

from rest_framework.views import APIView

from rest_framework.response import Response

from django.db.models import Q

from menu.models import (
    ProductVariant,
    Combo,
    ServiceCharge
)

from .serializers import (
    POSProductListSerializer,
    POSComboListSerializer,
)


# ==========================================
# POS DASHBOARD VIEW
# ==========================================
class POSDashboardView(APIView):

    def get(self, request):

        restaurant_id = request.GET.get(
            "restaurant_id"
        )

        category_id = request.GET.get(
            "category_id"
        )

        search = request.GET.get(
            "search"
        )

        is_veg = request.GET.get(
            "is_veg"
        )

        # ==========================================
        # PRODUCT QUERYSET
        # ==========================================
        product_queryset = ProductVariant.objects.filter(
            product__restaurant_id=restaurant_id,
            is_available=True,
            product__is_available=True,
        )

        # ==========================================
        # CATEGORY FILTER
        # ==========================================
        if category_id:

            product_queryset = product_queryset.filter(
                product__category_id=category_id
            )

        # ==========================================
        # SEARCH FILTER
        # ==========================================
        if search:

            product_queryset = product_queryset.filter(
                Q(product__name__icontains=search)
            )

        # ==========================================
        # VEG FILTER
        # ==========================================
        if is_veg == "true":

            product_queryset = product_queryset.filter(
                product__is_veg=True
            )

        # ==========================================
        # COMBO QUERYSET
        # ==========================================
        combo_queryset = Combo.objects.filter(
            restaurant_id=restaurant_id,
            is_active=True,
        )

        # ==========================================
        # SEARCH FILTER FOR COMBO
        # ==========================================
        if search:

            combo_queryset = combo_queryset.filter(
                Q(name__icontains=search)
            )

        # ==========================================
        # SERIALIZED DATA
        # ==========================================
        product_data = POSProductListSerializer(
            product_queryset.select_related(
                "product",
                "product__category",
            ),
            many=True,
            context={"request": request},
        ).data

        combo_data = POSComboListSerializer(
            combo_queryset,
            many=True,
            context={"request": request},
        ).data

        # ==========================================
        # SERVICE CHARGES
        # ==========================================
        service_charges = (
            ServiceCharge.objects
            .filter(
                restaurant_id=restaurant_id,
                is_active=True,
            )
        )
        print("1",product_data)
        print("2",combo_data)
        print("2",service_charges)
        # ==========================================
        # FINAL RESPONSE
        # ==========================================
        return Response({
            "products": product_data,
            "combos": combo_data,

            "service_charges": [
                {
                    "id": charge.id,
                    "name": charge.name,
                    "charge_type": charge.charge_type,
                    "value": charge.value,
                    "applicable_order_types": charge.applicable_order_types or [],
                }
                for charge in service_charges
            ]
        })
