from decimal import Decimal

from menu.models import (
    ProductTax,
    ServiceCharge,
)


# =========================================================
# CALCULATE ORDER TOTALS
# =========================================================
def calculate_order_totals(
    restaurant_id,
    order_type,
    items,
    discount_amount=Decimal("0"),
    round_off_amount=Decimal("0"),
):

    subtotal = Decimal("0")

    tax_total = Decimal("0")

    tax_breakdown = []

    # =====================================================
    # ITEMS
    # =====================================================
    for item in items:

        quantity = Decimal(str(item["quantity"]))

        final_price = Decimal(str(item["final_price"]))

        # =================================================
        # ADDONS TOTAL
        # =================================================
        addon_total = Decimal("0")

        for addon in item.get("addons", []):

            addon_price = Decimal(
                str(addon["addon_price"])
            )

            addon_quantity = Decimal(
                str(addon.get("quantity", 1))
            )

            addon_total += (
                addon_price * addon_quantity
            )

        # =================================================
        # PRODUCT TOTAL ONLY
        # TAX SHOULD NOT INCLUDE ADDONS
        # =================================================
        product_total = (
            final_price * quantity
        )

        # =================================================
        # FULL ITEM TOTAL
        # SUBTOTAL STILL INCLUDES ADDONS
        # =================================================
        item_total = (
            product_total + addon_total
        )

        subtotal += item_total

        # =================================================
        # PRODUCT TAXES
        # =================================================
        if item["item_type"] == "product":

            product_taxes = (
                ProductTax.objects
                .select_related("tax")
                .filter(
                    product_id=item["product_id"],
                    tax__is_active=True,
                )
            )

            for mapping in product_taxes:

                tax = mapping.tax

                tax_amount = (
                    product_total
                    * Decimal(str(tax.percentage))
                    / Decimal("100")
                )
                print(
    "\nPRODUCT TAX =>",
    {
        "product_id": item["product_id"],
        "product_total": product_total,
        "tax_name": tax.name,
        "tax_percentage": tax.percentage,
        "tax_amount": tax_amount,
    }
)

                tax_total += tax_amount

                existing_tax = next(
                    (
                        t
                        for t in tax_breakdown
                        if (
                            t["name"] == tax.name
                            and
                            Decimal(str(t["percentage"]))
                            == Decimal(str(tax.percentage))
                        )
                    ),
                    None,
                )

                if existing_tax:

                    existing_tax["amount"] += tax_amount

                else:

                    tax_breakdown.append({
                        "name": tax.name,
                        "percentage": tax.percentage,
                        "amount": tax_amount,
                    })


        # =================================================
        # COMBO TAXES
        # =================================================

        elif item["item_type"] == "combo":

            for combo_item in item.get("combo_items", []):

                combo_item_total = (
                    Decimal(str(combo_item["allocated_price"]))
                    * Decimal(str(combo_item.get("quantity", 1)))
                    * quantity
                )

                for tax in combo_item.get("taxes", []):

                    tax_amount = (
                        combo_item_total
                        * Decimal(str(tax["percentage"]))
                        / Decimal("100")
                    )
                    print(
    "\nCOMBO TAX =>",
    {
        "allocated_price": combo_item["allocated_price"],
        "combo_quantity": combo_item.get("quantity", 1),
        "cart_quantity": quantity,
        "combo_item_total": combo_item_total,
        "tax_name": tax["name"],
        "tax_percentage": tax["percentage"],
        "tax_amount": tax_amount,
    }
)
                    tax_total += tax_amount

                    existing_tax = next(
                        (
                            t
                            for t in tax_breakdown
                            if (
                                t["name"] == tax["name"]
                                and Decimal(str(t["percentage"]))
                                == Decimal(str(tax["percentage"]))
                            )
                        ),
                        None,
                    )

                    if existing_tax:

                        existing_tax["amount"] += tax_amount

                    else:

                        tax_breakdown.append({
                            "name": tax["name"],
                            "percentage": tax["percentage"],
                            "amount": tax_amount,
                        })
    # =====================================================
    # SERVICE CHARGES
    # =====================================================
    service_charge_total = Decimal("0")

    service_charge_breakdown = []

    service_charges = ServiceCharge.objects.filter(
        restaurant_id=restaurant_id,
        is_active=True,
        applicable_order_types__contains=[
            order_type
        ],
    )

    for charge in service_charges:

        if charge.charge_type == "percentage":

            amount = (
                subtotal
                * Decimal(str(charge.value))
                / Decimal("100")
            )

        else:

            amount = Decimal(str(charge.value))

        service_charge_total += amount

        service_charge_breakdown.append({
            "name": charge.name,
            "charge_type": charge.charge_type,
            "value": charge.value,
            "amount": amount,
        })

    # =====================================================
    # GRAND TOTAL
    # =====================================================
    grand_total = (
        subtotal
        + tax_total
        + service_charge_total
        - Decimal(str(discount_amount))
        + Decimal(str(round_off_amount))
    )

    if grand_total < 0:

        grand_total = Decimal("0")
    print("\n================ FINAL TOTALS ================\n")

    print("SUBTOTAL:", subtotal)

    print("TAX TOTAL:", tax_total)

    print("SERVICE CHARGE:", service_charge_total)

    print("GRAND TOTAL:", grand_total)

    print("\nTAX BREAKDOWN:")

    for tax in tax_breakdown:
        print(tax)

    print("\n==============================================\n")
    return {
        "subtotal": subtotal,
        "tax_total": tax_total,
        "tax_breakdown": tax_breakdown,
        "service_charge_total": (
            service_charge_total
        ),
        "service_charge_breakdown": (
            service_charge_breakdown
        ),
        "grand_total": grand_total,
    }