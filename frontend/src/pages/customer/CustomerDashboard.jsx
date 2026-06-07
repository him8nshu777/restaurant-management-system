import { useState, useEffect } from "react";

import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";

import RestaurantsPage from "./RestaurantsPage";
import ActiveOrders from "./ActiveOrders";
import OrderHistory from "./OrderHistory";
import Profile from "../profile/Profile";
import PaymentPage from "../payment/PaymentPage";
import OrderPage from "./OrderPage";

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
            setActivePage={setActivePage}
          />
        );
      
      case "restaurant-menu":
        return (
          <OrderPage
            restaurant={activePage.restaurant}
            setActivePage={setActivePage}
          />
        );

      case "payment":
        return (
            <PaymentPage
                orderId={activePage.orderId}
                order={activePage.order}
                setActivePage={setActivePage}
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
