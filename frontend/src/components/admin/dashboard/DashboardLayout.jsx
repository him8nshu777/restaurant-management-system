import Sidebar from "./Sidebar";


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

    return (

        <div className="d-flex">

            {/* ==========================================
                SIDEBAR
            ========================================== */}
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}

                restaurants={restaurants}

                activeRestaurant={activeRestaurant}

                setActiveRestaurant={setActiveRestaurant}
            />


            {/* ==========================================
                MAIN CONTENT AREA
            ========================================== */}
            <div className="dashboard-content flex-grow-1 p-4 bg-light min-vh-100">

                {children}

            </div>

        </div>
    );
}