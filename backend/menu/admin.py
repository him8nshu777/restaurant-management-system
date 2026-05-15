from django.contrib import admin


from .models import Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboItem, Tax, ProductTax, Offer, OfferProduct 


admin.site.register([Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboItem, Tax, ProductTax, Offer, OfferProduct ])