import { useState, useEffect } from "react";
import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
// import POSDashboard from "./POSDashboard";
// import OrderList from "../dashboard/orders/OrderList";
import DeliveryOrders from "./DeliveryOrders";
import ActiveOrders from "./ActiveOrders";
import DeliveryHistory from "./DeliveryHistory";
export default function DeliveryDashboard() {
    // Moved state inside the component
    const [activePage, setActivePage] = useState({ type: "orders" });

    // PAGE RENDERER
    const renderPage = () => {
        console.log("ACTIVE PAGE:", activePage);
        switch (activePage.type) {
            case "orders":
                return <DeliveryOrders />;

            case "active-orders":
                return <ActiveOrders />;

            case "order-history":
                return <DeliveryHistory />;
            default:
                return <DeliveryOrders />;
        }
    };

    return (
        <DashboardLayout
            activePage={activePage}
            setActivePage={setActivePage}
        >
            {renderPage()}
        </DashboardLayout>
    );
}
