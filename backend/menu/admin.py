from django.contrib import admin


from .models import Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboProduct, Tax, ProductTax,DynamicPricing, ProductDynamicPricing, ComboDynamicPricing, Offer, OfferProduct 


admin.site.register([Category, Product, ProductVariant, Addon, ProductAddon, Combo, ComboProduct, Tax, ProductTax,DynamicPricing, ProductDynamicPricing, ComboDynamicPricing, Offer, OfferProduct ])