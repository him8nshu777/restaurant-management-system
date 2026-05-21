from django.contrib import admin


from .models import Order, OrderItem, OrderItemAddon, OrderPayment, OrderStatusHistory


admin.site.register([Order, OrderItem, OrderItemAddon, OrderPayment, OrderStatusHistory])