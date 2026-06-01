from decimal import Decimal

from .models import (
    ProductRecipe,
    ComboRecipe,
    InventoryTransaction,
)


def deduct_order_inventory(order):

    if order.inventory_deducted:
        return

    for item in order.items.all():

        # =====================================
        # PRODUCT
        # =====================================
        if item.item_type == "product":

            recipes = ProductRecipe.objects.select_related("ingredient").filter(
                product_variant=item.product_variant
            )

            for recipe in recipes:

                deduction_qty = recipe.quantity * item.quantity

                ingredient = recipe.ingredient

                ingredient.current_stock -= deduction_qty

                ingredient.save(update_fields=["current_stock"])

                InventoryTransaction.objects.create(
                    restaurant=order.restaurant,
                    ingredient=ingredient,
                    transaction_type="sale",
                    quantity=deduction_qty,
                    note=(f"Order #{order.id} - " f"{item.item_name}"),
                )

        # =====================================
        # COMBO
        # =====================================
        elif item.item_type == "combo":

            combo_recipes = ComboRecipe.objects.select_related(
                "product_variant"
            ).filter(combo=item.combo)

            for combo_recipe in combo_recipes:

                product_qty = combo_recipe.quantity * item.quantity

                product_recipes = ProductRecipe.objects.select_related(
                    "ingredient"
                ).filter(product_variant=combo_recipe.product_variant)

                for recipe in product_recipes:

                    deduction_qty = recipe.quantity * product_qty

                    ingredient = recipe.ingredient

                    ingredient.current_stock -= deduction_qty

                    ingredient.save(update_fields=["current_stock"])

                    InventoryTransaction.objects.create(
                        restaurant=order.restaurant,
                        ingredient=ingredient,
                        transaction_type="sale",
                        quantity=deduction_qty,
                        note=(f"Order #{order.id} - " f"{item.item_name}"),
                    )

    order.inventory_deducted = True

    order.save(update_fields=["inventory_deducted"])
