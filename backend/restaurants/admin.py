from django.contrib import admin


from .models import Restaurant, Floor, Area, RestaurantTable


admin.site.register([Restaurant, Floor, Area, RestaurantTable])