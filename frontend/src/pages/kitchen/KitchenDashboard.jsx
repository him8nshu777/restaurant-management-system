import { useState, useEffect } from "react";
import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
import KitchenOrders from "./KitchenOrders";

export default function KitchenDashboard() {
    // Moved state inside the component
    const [activePage, setActivePage] = useState({ type: "kitchen-orders" });

    // PAGE RENDERER
    const renderPage = () => {
        switch (activePage.type) {
            case "kitchen-orders":
                return <KitchenOrders />;
            default:
                return <KitchenOrders />;
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
