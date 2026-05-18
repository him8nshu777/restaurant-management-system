from django.contrib import admin


from .models import Unit, Ingredient, Supplier, InventoryTransaction, Purchase, ProductRecipe, ComboRecipe


admin.site.register([Unit, Ingredient, Supplier, InventoryTransaction, Purchase, ProductRecipe, ComboRecipe])