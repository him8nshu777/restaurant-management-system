import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Modal, Button } from "react-bootstrap";

import { useSelector } from "react-redux";

import { getNearbyRestaurants } from "../../services/customerService";

export default function RestaurantsPage() {
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // ==========================================
  // RESTAURANTS
  // ==========================================
  const [restaurants, setRestaurants] = useState([]);

  // ==========================================
  // LOADING
  // ==========================================
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOGIN MODAL
  // ==========================================
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ==========================================
  // SELECTED RESTAURANT
  // ==========================================
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  
  // ==========================================
  // USER LOCATION
  // ==========================================
  const [location, setLocation] = useState({
    latitude: 25.2138,
    longitude: 75.8648,
  });

  // ==========================================
  // LOCATION LOADING
  // ==========================================
  const [loadingLocation, setLoadingLocation] = useState(true);

  // ==========================================
  // FETCH LOCATION ON LOAD
  // ==========================================
  useEffect(() => {
    getUserLocation();
  }, []);

  // ==========================================
  // GET USER LOCATION
  // ==========================================
  const getUserLocation = () => {
    // ========================================
    // GEOLOCATION NOT SUPPORTED
    // ========================================
    if (!navigator.geolocation) {
      setLoadingLocation(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      // SUCCESS
      (position) => {
        setLocation({
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,
        });

        setLoadingLocation(false);
      },

      // ERROR / DENIED
      () => {
        // Fallback location already set
        setLoadingLocation(false);
      },

      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      },
    );
  };

  
  // ==========================================
  // FETCH RESTAURANTS
  // ==========================================
  useEffect(() => {
    // Wait for location
    if (loadingLocation) return;

    fetchRestaurants();
  }, [location.latitude, location.longitude, loadingLocation]);

  // ==========================================
  // FETCH RESTAURANTS
  // ==========================================
  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const data = await getNearbyRestaurants({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setRestaurants(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESTAURANT CLICK
  // ==========================================
  const handleRestaurantClick = (restaurant) => {
    // CUSTOMER
    if (isAuthenticated && user?.role === "customer") {
      navigate(`/restaurants/${restaurant.id}/menu`);

      return;
    }

    // PUBLIC USER
    setSelectedRestaurant(restaurant);

    setShowLoginModal(true);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading || loadingLocation) {
    return (
      <div
        className="
          vh-100
          d-flex
          justify-content-center
          align-items-center
        "
      >
        <h3>Loading Restaurants...</h3>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Nearby Restaurants</h2>

      <div className="row g-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="col-md-4">
            <div
              className="card h-100 shadow-sm"
              style={{
                cursor: "pointer",
              }}
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                alt={restaurant.name}
                className="card-img-top"
                style={{
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              <div className="card-body">
                <h5 className="fw-bold">{restaurant.name}</h5>

                <p className="text-muted small">{restaurant.address}</p>

                {restaurant.distance && (
                  <p className="text-success fw-semibold">
                    {restaurant.distance} km away
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LOGIN MODAL */}
      <Modal
        show={showLoginModal}
        centered
        onHide={() => setShowLoginModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>

        <Modal.Body>Please login to see food.</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Close
          </Button>

          <Button variant="success" onClick={() => navigate("/customer/login")}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
