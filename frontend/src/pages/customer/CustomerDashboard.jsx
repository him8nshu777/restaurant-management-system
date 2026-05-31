import { useState, useEffect } from "react";

import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";

import RestaurantsPage from "./RestaurantsPage";
import ActiveOrders from "./ActiveOrders";
import OrderHistory from "./OrderHistory";

export default function CustomerDashboard() {
  // ==========================================
  // ACTIVE PAGE
  // ==========================================
  const [activePage, setActivePage] = useState({
    type: "restaurants",
  });

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
  // PAGE RENDERER
  // ==========================================
  const renderPage = () => {
    console.log("ACTIVE PAGE:", activePage);

    switch (activePage.type) {
      case "restaurants":
        return (
          <RestaurantsPage
            latitude={location.latitude}
            longitude={location.longitude}
            loadingLocation={loadingLocation}
          />
        );
      case "active-orders":
        return <ActiveOrders />;

      case "order-history":
        return <OrderHistory />;

      default:
        return (
          <RestaurantsPage
            latitude={location.latitude}
            longitude={location.longitude}
            loadingLocation={loadingLocation}
          />
        );
    }
  };

  return (
    <DashboardLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
}
