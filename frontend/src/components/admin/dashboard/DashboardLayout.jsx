import Sidebar from "./Sidebar";


// ==========================================
// REUSABLE DASHBOARD LAYOUT
// ==========================================
export default function DashboardLayout({

    activePage,
    setActivePage,
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