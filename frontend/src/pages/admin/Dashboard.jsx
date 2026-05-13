import { useState } from "react";

import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";

import Reports from "./Reports";
import Staff from "./Staff";


// ==========================================
// ADMIN DASHBOARD CONTROLLER
// ==========================================
export default function Dashboard() {

    // Default page
    const [activePage, setActivePage] = useState("reports");


    // ==========================================
    // PAGE RENDERER
    // ==========================================
    const renderPage = () => {

        switch (activePage) {

            case "staff":
                return <Staff />;

            case "reports":
                return <Reports />;

            default:
                return <Reports />;
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