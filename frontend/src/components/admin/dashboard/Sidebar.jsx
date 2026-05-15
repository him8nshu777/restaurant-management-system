import { useState } from "react";

import {
    BarChartFill,
    PeopleFill,
    ReceiptCutoff,
    ClipboardCheck,
    List,
    ChevronDown,
    PlusCircle,
    Trash,
    CheckCircleFill,
    Building,
    GridFill,
    BoundingBox,
    Table,
} from "react-bootstrap-icons";

import { useEffect } from "react";

import { getRestaurants } from "../../../services/adminService";

import "./sidebar.css";
import { useDispatch, useSelector, } from "react-redux";
import { setActiveRestaurant, } from "../../../features/restaurants/restaurantSlice";
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

    // ==========================================
    // FLOOR MANAGEMENT
    // ==========================================
    {
        key: "floors",
        label: "Floors",
        icon: <GridFill />,
    },

    // ==========================================
    // AREA MANAGEMENT
    // ==========================================
    {
        key: "areas",
        label: "Areas",
        icon: <BoundingBox />,
    },
    // ==========================================
    // TABLE MANAGEMENT
    // ==========================================
    {
        key: "tables",
        label: "Tables",
        icon: <Table />,
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
// TEMP RESTAURANT DATA
// ==========================================
// Later fetch from backend API
// ==========================================

// ==========================================
// REUSABLE SIDEBAR
// ==========================================
export default function Sidebar({ activePage, setActivePage }) {
    // ==========================================
    // SIDEBAR COLLAPSE STATE
    // ==========================================
    const [collapsed, setCollapsed] = useState(false);

    // ==========================================
    // PROFILE DROPDOWN STATE
    // ==========================================
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // ==========================================
    // CURRENT ACTIVE RESTAURANT
    // ==========================================
    const [restaurants, setRestaurants] = useState([]);

    // const [activeRestaurant, setActiveRestaurant] = useState(null);

    const dispatch = useDispatch();

const activeRestaurant =
    useSelector(
        (state) =>
            state.restaurant.activeRestaurant
    );

    // ==========================================
    // SWITCH RESTAURANT
    // ==========================================
    const handleSwitchRestaurant = (restaurant) => {
        // setActiveRestaurant(restaurant);
        dispatch(
    setActiveRestaurant(
        restaurant
    )
);
// ==========================================
    // SAVE IN LOCAL STORAGE
    // ==========================================
    localStorage.setItem(

        "activeRestaurant",

        JSON.stringify(restaurant)
    );

    // ==========================================
    // RELOAD WHOLE DASHBOARD
    // ==========================================
    window.location.reload();

        // Later:
        // save in Redux/localStorage
        // call backend refresh
    };

    // ==========================================
    // FETCH OWNER RESTAURANTS
    // ==========================================
    useEffect(() => {
        fetchRestaurants();
    }, []);

    // ==========================================
    // FETCH FUNCTION
    // ==========================================
    const fetchRestaurants = async () => {
        try {
            const data = await getRestaurants();

            setRestaurants(data);

            // Default selected branch
            if (
                data.length > 0 &&
                !activeRestaurant
            ) {

                dispatch(
                    setActiveRestaurant(
                        data[0]
                    )
                );
                localStorage.setItem(
        "activeRestaurant",
        JSON.stringify(data[0])
    );
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div
            className={`
                sidebar
                text-white
                p-3
                d-flex
                flex-column
                justify-content-between
                ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}
            `}
        >
            <div>
                {/* ==========================================
                    TOP SECTION
                ========================================== */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    {!collapsed && <h4 className="fw-bold mb-0">ERP</h4>}

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
                            onClick={() => setActivePage({ type: item.key })}
                            className={`
                                sidebar-button
                                btn
                                d-flex
                                align-items-center
                                gap-3
                                py-2
                                ${activePage.type === item.key
                                    ? "btn-primary"
                                    : "btn-outline-light"
                                }
                            `}
                        >
                            {/* ICON */}
                            <span className="fs-5">{item.icon}</span>

                            {/* LABEL */}
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* ==========================================
                PROFILE / RESTAURANT SECTION
            ========================================== */}
            <div className="mt-4">
                <hr />

                {/* PROFILE BUTTON */}
                <button
                    className="
                        btn
                        btn-outline-light
                        w-100
                        d-flex
                        align-items-center
                        justify-content-between
                    "
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <div
                        className="
                            d-flex
                            align-items-center
                            gap-2
                        "
                    >
                        {/* PROFILE ICON */}
                        <Building size={18} />

                        {/* RESTAURANT NAME */}
                        {!collapsed && (
                            <div className="text-start">
                                <div
                                    className="
                                        small
                                        fw-bold
                                    "
                                >
                                    {activeRestaurant?.name}
                                </div>

                                <div
                                    className="
                                        text-secondary
                                        small
                                    "
                                >
                                    Branch
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DROPDOWN ICON */}
                    {!collapsed && <ChevronDown />}
                </button>

                {/* ==========================================
                    DROPDOWN MENU
                ========================================== */}
                {showProfileMenu && !collapsed && (
                    <div
                        className="
                            bg-dark
                            border
                            border-secondary
                            rounded
                            mt-2
                            p-2
                        "
                    >
                        {/* ==========================================
                            RESTAURANT LIST
                        ========================================== */}
                        <div className="mb-2">
                            <small className="text-secondary">Your Branches</small>
                        </div>

                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant.id}
                                className="
                                    d-flex
                                    justify-content-between
                                    align-items-center
                                    p-2
                                    rounded
                                    mb-1
                                    restaurant-item
                                "
                            >
                                {/* LEFT SECTION */}
                                <div
                                    className="
                                        d-flex
                                        align-items-center
                                        gap-2
                                    "
                                >
                                    {/* ACTIVE CHECK */}
                                    {activeRestaurant?.id === restaurant.id && (
                                        <CheckCircleFill className="text-success" />
                                    )}

                                    {/* RESTAURANT NAME */}
                                    <div
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                            setActivePage({
                                                type: "restaurant-profile",
                                                restaurant,
                                            })
                                        }
                                    >
                                        <div className="small fw-semibold">{restaurant.name}</div>

                                        <div
                                            className="
                                                text-secondary
                                                small
                                            "
                                        >
                                            {restaurant.status}
                                        </div>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div
                                    className="
                                        d-flex
                                        gap-1
                                    "
                                >
                                    {/* SWITCH BUTTON */}
                                    <button
                                        className="
                                            btn
                                            btn-sm
                                            btn-outline-primary
                                        "
                                        onClick={() => handleSwitchRestaurant(restaurant)}
                                    >
                                        Switch
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* ==========================================
                            CREATE BRANCH BUTTON
                        ========================================== */}
                        <button
                            className="
                                btn
                                btn-primary
                                w-100
                                mt-2
                                d-flex
                                align-items-center
                                justify-content-center
                                gap-2
                            "
                            onClick={() =>
                                setActivePage({
                                    type: "create-restaurant",
                                })
                            }
                        >
                            <PlusCircle size={16} />
                            Create Branch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
