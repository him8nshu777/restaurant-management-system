# pos/serializers.py

from decimal import Decimal

from django.utils import timezone

from rest_framework import serializers

from menu.models import (
    ProductVariant,
    Combo,
    ProductDynamicPricing,
    ComboDynamicPricing,
    ProductTax,
)

from menu.utils.pricing import (
    apply_dynamic_pricing,
    is_dynamic_pricing_active,
    get_active_product_pricing,
    get_active_combo_pricing,
)

# ==========================================
# POS PRODUCT LIST SERIALIZER
# ==========================================
class POSProductListSerializer(
    serializers.ModelSerializer
):

    # ==========================================
    # TYPE
    # ==========================================
    type = serializers.SerializerMethodField()

    # ==========================================
    # VARIANT ID
    # ==========================================
    variant_id = serializers.IntegerField(
        source="id",
        read_only=True,
    )

    # ==========================================
    # PRODUCT NAME
    # ==========================================
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    # ==========================================
    # VARIANT NAME
    # ==========================================
    variant_name = serializers.CharField(
        source="name",
        read_only=True,
    )

    # ==========================================
    # CATEGORY ID
    # ==========================================
    category_id = serializers.IntegerField(
        source="product.category.id",
        read_only=True,
    )

    # ==========================================
    # CATEGORY NAME
    # ==========================================
    category_name = serializers.CharField(
        source="product.category.name",
        read_only=True,
    )

    # ==========================================
    # IMAGE
    # ==========================================
    image = serializers.SerializerMethodField()

    # ==========================================
    # VEG / NON VEG
    # ==========================================
    is_veg = serializers.BooleanField(
        source="product.is_veg",
        read_only=True,
    )

    # ==========================================
    # DYNAMIC PRICING
    # ==========================================
    original_price = serializers.DecimalField(
        source="price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    final_price = serializers.SerializerMethodField()

    dynamic_pricing_name = serializers.SerializerMethodField()

    is_dynamic_pricing_applied = serializers.SerializerMethodField()
    
    addons = serializers.SerializerMethodField()

    taxes = serializers.SerializerMethodField()
    class Meta:

        model = ProductVariant

        fields = (
            "type",
            "variant_id",
            "product_name",
            "variant_name",
            "category_id",
            "category_name",
            "original_price",
            "final_price",
            "dynamic_pricing_name",
            "is_dynamic_pricing_applied",
            "image",
            "is_veg",
            "is_available",
            "addons",
            "taxes",
        )

    # ==========================================
    # TYPE
    # ==========================================
    def get_type(self, obj):

        return "product"

    # ==========================================
    # IMAGE
    # ==========================================
    def get_image(self, obj):

        request = self.context.get(
            "request"
        )

        if (
            obj.product.image
            and request
        ):

            return request.build_absolute_uri(
                obj.product.image.url
            )

        return None

    # ==========================================
    # GET ACTIVE PRODUCT PRICING
    # ==========================================
    def get_active_pricing(self, obj):

        mappings = ProductDynamicPricing.objects.filter(
            product=obj.product
        ).select_related(
            "dynamic_pricing"
        ).order_by(
            "dynamic_pricing__priority"
        )

        for mapping in mappings:

            pricing = mapping.dynamic_pricing

            if is_dynamic_pricing_active(
                pricing
            ):

                return pricing

        return None


    # ==========================================
    # ORIGINAL PRICE
    # ==========================================
    def get_original_price(self, obj):

        return obj.price


    # ==========================================
    # FINAL PRICE
    # ==========================================
    def get_final_price(self, obj):

        pricing = get_active_product_pricing(obj.product)

        if pricing:

            return apply_dynamic_pricing(
                obj.price,
                pricing,
            )

        return obj.price


    # ==========================================
    # PRICING NAME
    # ==========================================
    def get_dynamic_pricing_name(
        self,
        obj,
    ):

        pricing = get_active_product_pricing(obj.product)

        if pricing:

            return pricing.name

        return None


    # ==========================================
    # PRICING APPLIED
    # ==========================================
    def get_is_dynamic_pricing_applied(
        self,
        obj,
    ):

        pricing = get_active_product_pricing(obj.product)


        return pricing is not None

    # ==========================================
    # GET TAXES
    # ==========================================
    def get_taxes(self, obj):

        tax_mappings = (
            ProductTax.objects
            .select_related("tax")
            .filter(
                product=obj.product,
                tax__is_active=True,
            )
        )

        taxes = []

        for mapping in tax_mappings:

            taxes.append({
                "id": mapping.tax.id,
                "name": mapping.tax.name,
                "percentage": mapping.tax.percentage,
            })

        return taxes

    # ==========================================
    # GET ADDONS
    # ==========================================
    def get_addons(self, obj):

        product = obj.product

        addon_mappings = (
            product.product_addons
            .select_related("addon")
            .filter(addon__is_active=True)
        )

        addons = []

        for mapping in addon_mappings:

            addons.append({
                "id": mapping.addon.id,
                "name": mapping.addon.name,
                "price": mapping.addon.price,
            })

        return addons
# ==========================================
# POS COMBO LIST SERIALIZER
# ==========================================
class POSComboListSerializer(
    serializers.ModelSerializer
):

    # ==========================================
    # TYPE
    # ==========================================
    type = serializers.SerializerMethodField()

    # ==========================================
    # COMBO ID
    # ==========================================
    combo_id = serializers.IntegerField(
        source="id",
        read_only=True,
    )

    # ==========================================
    # COMBO NAME
    # ==========================================
    combo_name = serializers.SerializerMethodField()

    # ==========================================
    # DYNAMIC PRICING
    # ==========================================
    original_price = serializers.SerializerMethodField()

    final_price = serializers.SerializerMethodField()

    dynamic_pricing_name = serializers.SerializerMethodField()

    is_dynamic_pricing_applied = serializers.SerializerMethodField()

    # ==========================================
    # IMAGE
    # ==========================================
    image = serializers.SerializerMethodField()

    # ==========================================
    # COMBO ITEMS
    # ==========================================
    combo_items = serializers.SerializerMethodField()

    class Meta:

        model = Combo

        fields = (
            "type",
            "combo_id",
            "combo_name",
            "original_price",
            "final_price",
            "dynamic_pricing_name",
            "is_dynamic_pricing_applied",
            "image",
            "combo_items",
            "is_active",
        )

    # ==========================================
    # TYPE
    # ==========================================
    def get_type(self, obj):

        return "combo"

    # ==========================================
    # COMBO NAME
    # ==========================================
    def get_combo_name(self, obj):

        return obj.name

    # ==========================================
    # ORIGINAL PRICE
    # ==========================================
    def get_original_price(
        self,
        obj,
    ):

        return obj.combo_price

    # ==========================================
    # IMAGE
    # ==========================================
    def get_image(self, obj):

        request = self.context.get(
            "request"
        )

        if obj.image and request:

            return request.build_absolute_uri(
                obj.image.url
            )

        return None

    # ==========================================
    # ACTIVE PRICING
    # ==========================================
    def get_active_pricing(
        self,
        obj,
    ):

        mappings = (
            ComboDynamicPricing.objects.filter(
                combo=obj
            )
            .select_related(
                "dynamic_pricing"
            )
            .order_by(
                "-dynamic_pricing__priority"
            )
        )

        for mapping in mappings:

            pricing = (
                mapping.dynamic_pricing
            )

            if is_dynamic_pricing_active(
                pricing
            ):

                return pricing

        return None

    # ==========================================
    # FINAL PRICE
    # ==========================================
    def get_final_price(
        self,
        obj,
    ):

        pricing = get_active_combo_pricing(obj)
        if not pricing:

            return obj.combo_price

        return apply_dynamic_pricing(
            obj.combo_price,
            pricing,
        )

    # ==========================================
    # PRICING NAME
    # ==========================================
    def get_dynamic_pricing_name(
        self,
        obj,
    ):

        pricing = get_active_combo_pricing(obj)
        if pricing:

            return pricing.name

        return None

    # ==========================================
    # PRICING APPLIED
    # ==========================================
    def get_is_dynamic_pricing_applied(
        self,
        obj,
    ):

        return (
            self.get_active_pricing(obj)
            is not None
        )

    # ==========================================
    # COMBO ITEMS
    # ==========================================
    def get_combo_items(self, obj):

        recipes = obj.recipes.select_related(
            "product_variant",
            "product_variant__product",
        )

        items = []

        total_original_price = Decimal("0.00")

        # ==========================================
        # TOTAL ORIGINAL VALUE
        # ==========================================
        for recipe in recipes:

            total_original_price += (
                recipe.product_variant.price *
                recipe.quantity
            )

        # ==========================================
        # SAFETY
        # ==========================================
        if total_original_price <= 0:

            total_original_price = Decimal("1.00")

        # ==========================================
        # ITEM BREAKDOWN
        # ==========================================
        for recipe in recipes:

            variant = recipe.product_variant

            product = variant.product

            item_original_total = (
                variant.price *
                recipe.quantity
            )

            # ==========================================
            # PROPORTIONAL COMBO PRICE SPLIT
            # ==========================================
            proportional_price = (
                (
                    item_original_total /
                    total_original_price
                ) *
                obj.combo_price
            )

            # ==========================================
            # TAXES
            # ==========================================
            tax_mappings = (
                ProductTax.objects
                .select_related("tax")
                .filter(
                    product=product,
                    tax__is_active=True,
                )
            )

            taxes = []

            for mapping in tax_mappings:

                taxes.append({
                    "id": mapping.tax.id,
                    "name": mapping.tax.name,
                    "percentage": mapping.tax.percentage,
                })

            items.append({
                "product_name": product.name,
                "variant_name": variant.name,
                "quantity": recipe.quantity,

                # IMPORTANT
                "allocated_price": round(
                    proportional_price,
                    2,
                ),

                "taxes": taxes,
            })

        return items