from django.contrib import admin


from .models import Restaurant, Floor, Area


admin.site.register([Restaurant, Floor, Area])