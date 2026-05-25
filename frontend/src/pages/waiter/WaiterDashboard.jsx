import { useState, useEffect } from "react";
import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
import WaiterOrders from "./WaiterOrders";
import WaiterPOSDashboard from "./WaiterPOSDashboard";
import OrderList from "../dashboard/orders/OrderList";

export default function WaiterDashboard() {
    // Moved state inside the component
    const [activePage, setActivePage] = useState({ type: "pos-dashboard" });

    // PAGE RENDERER
    const renderPage = () => {
        switch (activePage.type) {
            case "pos-dashboard":
                return <WaiterPOSDashboard />;
            case "ready-orders":
                return <WaiterOrders />;
            case "orders":
                return <OrderList />;
            default:
                return <WaiterPOSDashboard />;
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
