import { useState } from "react";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import { List } from "react-bootstrap-icons";
// ==========================================
// REUSABLE DASHBOARD LAYOUT
// ==========================================
export default function DashboardLayout({

    activePage,
    setActivePage,

    restaurants,
    activeRestaurant,
    setActiveRestaurant,

    children,

}) {

    const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

    return (
        <>
        {
        mobileSidebarOpen && (
            <div
                className="sidebar-backdrop"
                onClick={() =>
                    setMobileSidebarOpen(false)
                }
            />
        )
    }
        <div className="dashboard-shell" >

            {/* ==========================================
                SIDEBAR
            ========================================== */}
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}

                restaurants={restaurants}

                activeRestaurant={activeRestaurant}

                setActiveRestaurant={setActiveRestaurant}

                mobileSidebarOpen={mobileSidebarOpen}
    setMobileSidebarOpen={setMobileSidebarOpen}
            />


            {/* ==========================================
                MAIN CONTENT AREA
            ========================================== */}
            <div className="dashboard-content">

                <div className="mobile-header mb-3">

        <button
            className="btn btn-dark"
            onClick={() =>
                setMobileSidebarOpen(true)
            }
        >
            <List />
        </button>

    </div>


                {children}

            </div>

        </div>
        </>
    );
}