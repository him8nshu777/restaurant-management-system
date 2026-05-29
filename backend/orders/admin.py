from django.contrib import admin


from .models import Order, OrderItem, OrderItemAddon, OrderPayment, OrderStatusHistory, OrderTax, OrderServiceCharge, OrderItemTax, OrderComboItem, OrderComboItemTax, OrderAddonTax


admin.site.register([Order, OrderItem, OrderItemAddon, OrderPayment, OrderStatusHistory, OrderTax, OrderServiceCharge, OrderItemTax, OrderComboItem, OrderComboItemTax, OrderAddonTax])