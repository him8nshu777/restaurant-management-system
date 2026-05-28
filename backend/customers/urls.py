from django.urls import path

from .views import UpdateCustomerLocationAPIView, NearbyRestaurantsAPIView

urlpatterns = [

    path("location/", UpdateCustomerLocationAPIView.as_view(), name="customer-location"),
    path("restaurants/nearby/", NearbyRestaurantsAPIView.as_view(), name="nearby-restaurants"),
]