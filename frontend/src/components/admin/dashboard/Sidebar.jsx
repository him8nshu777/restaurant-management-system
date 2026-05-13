import { useState } from "react";

import {
    BarChartFill,
    PeopleFill,
    ReceiptCutoff,
    ClipboardCheck,
    List,
} from "react-bootstrap-icons";

import "./sidebar.css";


// ==========================================
// SIDEBAR MENU CONFIGURATION
// ==========================================
const menuItems = [

    {
        key: "reports",
        label: "Reports",
        icon: <BarChartFill />,
    },

    {
        key: "staff",
        label: "Staff",
        icon: <PeopleFill />,
    },

    {
        key: "orders",
        label: "Orders",
        icon: <ClipboardCheck />,
    },

    {
        key: "billing",
        label: "Billing",
        icon: <ReceiptCutoff />,
    },
];


// ==========================================
// REUSABLE SIDEBAR COMPONENT
// ==========================================
export default function Sidebar({

    activePage,
    setActivePage,

}) {

    // ==========================================
    // SIDEBAR COLLAPSE STATE
    // ==========================================
    const [collapsed, setCollapsed] = useState(false);


    return (

        <div
            className={`
                sidebar
                text-white
                p-3
                ${collapsed
                    ? "sidebar-collapsed"
                    : "sidebar-expanded"
                }
            `}
        >

            {/* ==========================================
                SIDEBAR TOP SECTION
            ========================================== */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                {/* APP TITLE */}
                {!collapsed && (

                    <h4 className="fw-bold mb-0">
                        ERP
                    </h4>

                )}


                {/* COLLAPSE BUTTON */}
                <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setCollapsed(!collapsed)}
                >

                    <List size={20} />

                </button>

            </div>


            <hr />


            {/* ==========================================
                SIDEBAR MENU
            ========================================== */}
            <div className="d-flex flex-column gap-2">

                {menuItems.map((item) => (

                    <button
                        key={item.key}

                        onClick={() => setActivePage(item.key)}

                        className={`
                            sidebar-button
                            btn
                            d-flex
                            align-items-center
                            gap-3
                            py-2
                            ${activePage === item.key
                                ? "btn-primary"
                                : "btn-outline-light"
                            }
                        `}
                    >

                        {/* ICON */}
                        <span className="fs-5">
                            {item.icon}
                        </span>


                        {/* LABEL */}
                        <span
                            className={
                                collapsed
                                    ? "sidebar-label-hidden"
                                    : ""
                            }
                        >
                            {item.label}
                        </span>

                    </button>

                ))}

            </div>

        </div>
    );
}