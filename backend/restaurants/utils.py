from geopy.geocoders import Nominatim


# ==========================================
# CONVERT ADDRESS TO LAT/LONG
# ==========================================
def get_lat_long_from_address(address):

    try:

        geolocator = Nominatim(
            user_agent="restaurant_app"
        )

        location = geolocator.geocode(address)

        if not location:

            return None, None

        return (
            location.latitude,
            location.longitude,
        )

    except Exception as e:

        print("Geocoding Error:", e)

        return None, None