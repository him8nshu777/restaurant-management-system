import { useState, useEffect } from "react";
import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
import POSDashboard from "./POSDashboard";
import OrderList from "../dashboard/orders/OrderList";

export default function PosMainDashboard() {
    // Moved state inside the component
    const [activePage, setActivePage] = useState({ type: "pos-dashboard" });

    // PAGE RENDERER
    const renderPage = () => {
        switch (activePage.type) {
            case "pos-dashboard":
                return <POSDashboard />;

            case "orders":
                return <OrderList />;
            default:
                return <POSDashboard />;
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
