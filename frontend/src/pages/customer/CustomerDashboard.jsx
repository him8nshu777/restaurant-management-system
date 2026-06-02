import { useState, useEffect } from "react";

import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";

import RestaurantsPage from "./RestaurantsPage";
import ActiveOrders from "./ActiveOrders";
import OrderHistory from "./OrderHistory";
import Profile from "../profile/Profile";

export default function CustomerDashboard() {
  // ==========================================
  // ACTIVE PAGE
  // ==========================================
  const [activePage, setActivePage] = useState({
    type: "restaurants",
  });


  // ==========================================
  // PAGE RENDERER
  // ==========================================
  const renderPage = () => {
    console.log("ACTIVE PAGE:", activePage);

    switch (activePage.type) {
      case "restaurants":
        return (
          <RestaurantsPage
          />
        );
      case "active-orders":
        return <ActiveOrders />;

      case "order-history":
        return <OrderHistory />;

      case "profile":
        return <Profile />;

      default:
        return (
          <RestaurantsPage />
        );
    }
  };

  return (
    <DashboardLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
}
