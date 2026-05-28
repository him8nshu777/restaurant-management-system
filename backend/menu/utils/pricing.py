from decimal import Decimal

from django.utils import timezone

from menu.models import (
    ProductVariant,
    Combo,
    ProductDynamicPricing,
    ComboDynamicPricing,
    ProductTax,
)


# =========================================================
# CHECK DAY VALID
# =========================================================
def is_day_valid(dynamic_pricing, current_day):

    if not dynamic_pricing.days:
        return True

    valid_days = [
        day.strip().lower()
        for day in dynamic_pricing.days.split(",")
    ]

    return current_day in valid_days


# =========================================================
# CHECK DYNAMIC PRICING ACTIVE
# =========================================================
def is_dynamic_pricing_active(dynamic_pricing):

    now = timezone.localtime()

    current_date = now.date()

    current_time = now.time()

    current_day = now.strftime("%a").lower()

    # DATE CHECK
    if (
        dynamic_pricing.start_date
        and current_date < dynamic_pricing.start_date
    ):
        return False

    if (
        dynamic_pricing.end_date
        and current_date > dynamic_pricing.end_date
    ):
        return False

    # TIME CHECK
    if (
        dynamic_pricing.start_time
        and current_time < dynamic_pricing.start_time
    ):
        return False

    if (
        dynamic_pricing.end_time
        and current_time > dynamic_pricing.end_time
    ):
        return False

    # DAY CHECK
    if not is_day_valid(
        dynamic_pricing,
        current_day,
    ):
        return False

    return dynamic_pricing.is_active


# =========================================================
# APPLY DYNAMIC PRICING
# =========================================================
def apply_dynamic_pricing(
    original_price,
    pricing,
):

    final_price = Decimal(str(original_price))

    # PERCENTAGE INCREASE
    if pricing.pricing_type == "percentage_increase":

        final_price += (
            final_price
            * pricing.value
            / Decimal("100")
        )

    # FLAT INCREASE
    elif pricing.pricing_type == "flat_increase":

        final_price += pricing.value

    # PERCENTAGE DISCOUNT
    elif pricing.pricing_type == "percentage_discount":

        final_price -= (
            final_price
            * pricing.value
            / Decimal("100")
        )

    # FLAT DISCOUNT
    elif pricing.pricing_type == "flat_discount":

        final_price -= pricing.value

    # AVOID NEGATIVE
    if final_price < 0:
        final_price = Decimal("0")

    return round(final_price, 2)


# =========================================================
# GET ACTIVE PRODUCT PRICING
# =========================================================
def get_active_product_pricing(product):

    mappings = (
        ProductDynamicPricing.objects
        .filter(product=product)
        .select_related("dynamic_pricing")
        .order_by("dynamic_pricing__priority")
    )

    for mapping in mappings:

        pricing = mapping.dynamic_pricing

        if is_dynamic_pricing_active(pricing):

            return pricing

    return None


# =========================================================
# GET ACTIVE COMBO PRICING
# =========================================================
def get_active_combo_pricing(combo):

    mappings = (
        ComboDynamicPricing.objects
        .filter(combo=combo)
        .select_related("dynamic_pricing")
        .order_by("dynamic_pricing__priority")
    )

    for mapping in mappings:

        pricing = mapping.dynamic_pricing

        if is_dynamic_pricing_active(pricing):

            return pricing

    return None


# =========================================================
# CALCULATE PRODUCT PRICE
# =========================================================
def calculate_product_price(product_variant):

    original_price = Decimal(
        str(product_variant.price)
    )

    pricing = get_active_product_pricing(
        product_variant.product
    )

    final_price = original_price

    dynamic_pricing_name = None

    if pricing:

        final_price = apply_dynamic_pricing(
            original_price,
            pricing,
        )

        dynamic_pricing_name = pricing.name

    return {
        "original_price": original_price,
        "final_price": final_price,
        "dynamic_pricing_name": dynamic_pricing_name,
    }


# =========================================================
# CALCULATE COMBO PRICE
# =========================================================
def calculate_combo_price(combo):

    original_price = Decimal(
        str(combo.combo_price)
    )

    pricing = get_active_combo_pricing(
        combo
    )

    final_price = original_price

    dynamic_pricing_name = None

    if pricing:

        final_price = apply_dynamic_pricing(
            original_price,
            pricing,
        )

        dynamic_pricing_name = pricing.name

    return {
        "original_price": original_price,
        "final_price": final_price,
        "dynamic_pricing_name": dynamic_pricing_name,
    }


# =========================================================
# CALCULATE PRODUCT TAXES
# =========================================================
def calculate_product_taxes(
    product,
    taxable_amount,
):

    tax_mappings = (
        ProductTax.objects
        .select_related("tax")
        .filter(
            product=product,
            tax__is_active=True,
        )
    )

    taxes = []

    total_tax = Decimal("0")

    for mapping in tax_mappings:

        tax = mapping.tax

        amount = (
            Decimal(str(taxable_amount))
            * Decimal(str(tax.percentage))
            / Decimal("100")
        )

        taxes.append({
            "name": tax.name,
            "percentage": tax.percentage,
            "amount": round(amount, 2),
        })

        total_tax += amount

    return {
        "taxes": taxes,
        "total_tax": round(total_tax, 2),
    }