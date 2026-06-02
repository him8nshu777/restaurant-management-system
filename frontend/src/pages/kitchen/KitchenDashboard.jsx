import { useState, useEffect } from "react";
import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
import KitchenOrders from "../kitchen/KitchenOrders";
import Profile from "../profile/Profile";

export default function KitchenDashboard() {
    // Moved state inside the component
    const [activePage, setActivePage] = useState({ type: "kitchen-orders" });

    // PAGE RENDERER
    const renderPage = () => {
        switch (activePage.type) {
            case "kitchen-orders":
                return <KitchenOrders />;

            case "profile":
                return <Profile />;
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
