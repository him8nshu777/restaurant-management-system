import { useState, useEffect } from "react";

import {
    BarChartFill,
    PeopleFill,
    ReceiptCutoff,
    ClipboardCheck,
    List,
    ChevronDown,
    ChevronRight,
    PlusCircle,
    CheckCircleFill,
    Building,
    GridFill,
    BoundingBox,
    Table,

    // ==========================================
    // MENU ICONS
    // ==========================================
    MenuButtonWideFill,
    TagsFill,
    CupHotFill,
    LayersFill,
    PlusSquareFill,
    CollectionFill,
    Percent,
    ClockFill,
} from "react-bootstrap-icons";

import { getRestaurants } from "../../../services/adminService";

import "./sidebar.css";

import { useDispatch, useSelector } from "react-redux";

import {
    setActiveRestaurant,
} from "../../../features/restaurants/restaurantSlice";


// ==========================================
// SIDEBAR MENU CONFIGURATION
// ==========================================
const menuItems = [

    // ==========================================
    // REPORTS
    // ==========================================
    {
        key: "reports",
        label: "Reports",
        icon: <BarChartFill />,
    },

    // ==========================================
    // STAFF
    // ==========================================
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

    // ==========================================
    // MENU MANAGEMENT DROPDOWN
    // ==========================================
    {
        key: "menu-management",
        label: "Menu Management",
        icon: <MenuButtonWideFill />,

        children: [

            // ======================================
            // CATEGORIES
            // ======================================
            {
                key: "categories",
                label: "Categories",
                icon: <TagsFill />,
            },

            // ======================================
            // PRODUCTS
            // ======================================
            {
                key: "products",
                label: "Products",
                icon: <CupHotFill />,
            },

            // ======================================
            // PRODUCT VARIANTS
            // ======================================
            {
                key: "product-variants",
                label: "Variants",
                icon: <LayersFill />,
            },

            // ======================================
            // ADDONS
            // ======================================
            {
                key: "addons",
                label: "Addons",
                icon: <PlusSquareFill />,
            },

            // ======================================
            // COMBOS
            // ======================================
            {
                key: "combos",
                label: "Combos",
                icon: <CollectionFill />,
            },

            // ======================================
            // TAXES
            // ======================================
            {
                key: "taxes",
                label: "Taxes",
                icon: <Percent />,
            },

            // ======================================
            // OFFERS / HAPPY HOURS
            // ======================================
            {
                key: "offers",
                label: "Offers",
                icon: <ClockFill />,
            },
        ],
    },

    // ==========================================
    // ORDERS
    // ==========================================
    {
        key: "orders",
        label: "Orders",
        icon: <ClipboardCheck />,
    },

    // ==========================================
    // BILLING
    // ==========================================
    {
        key: "billing",
        label: "Billing",
        icon: <ReceiptCutoff />,
    },
];


// ==========================================
// REUSABLE SIDEBAR
// ==========================================
export default function Sidebar({
    activePage,
    setActivePage,
}) {

    // ==========================================
    // SIDEBAR COLLAPSE STATE
    // ==========================================
    const [collapsed, setCollapsed] = useState(false);

    // ==========================================
    // PROFILE DROPDOWN STATE
    // ==========================================
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // ==========================================
    // MENU DROPDOWN STATE
    // ==========================================
    const [openMenus, setOpenMenus] = useState({
        "menu-management": true,
    });

    // ==========================================
    // RESTAURANTS
    // ==========================================
    const [restaurants, setRestaurants] = useState([]);

    const dispatch = useDispatch();

    // ==========================================
    // ACTIVE RESTAURANT
    // ==========================================
    const activeRestaurant = useSelector(
        (state) =>
            state.restaurant.activeRestaurant
    );

    // ==========================================
    // TOGGLE DROPDOWN MENU
    // ==========================================
    const toggleMenu = (menuKey) => {

        setOpenMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    // ==========================================
    // SWITCH RESTAURANT
    // ==========================================
    const handleSwitchRestaurant = (restaurant) => {

        dispatch(
            setActiveRestaurant(restaurant)
        );

        // ======================================
        // SAVE IN LOCAL STORAGE
        // ======================================
        localStorage.setItem(
            "activeRestaurant",
            JSON.stringify(restaurant)
        );

        // ======================================
        // RELOAD DASHBOARD
        // ======================================
        window.location.reload();
    };

    // ==========================================
    // FETCH RESTAURANTS
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

            // ======================================
            // DEFAULT ACTIVE RESTAURANT
            // ======================================
            if (
                data.length > 0 &&
                !activeRestaurant
            ) {

                dispatch(
                    setActiveRestaurant(data[0])
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
                ${collapsed
                    ? "sidebar-collapsed"
                    : "sidebar-expanded"
                }
            `}
        >

            {/* ======================================
                TOP SECTION
            ====================================== */}
            <div>

                {/* ======================================
                    HEADER
                ====================================== */}
                <div
                    className="
                        d-flex
                        justify-content-between
                        align-items-center
                        mb-4
                    "
                >

                    {!collapsed && (
                        <h4 className="fw-bold mb-0">
                            ERP
                        </h4>
                    )}

                    {/* COLLAPSE BUTTON */}
                    <button
                        className="
                            btn
                            btn-outline-light
                            btn-sm
                        "
                        onClick={() =>
                            setCollapsed(!collapsed)
                        }
                    >
                        <List size={20} />
                    </button>
                </div>

                <hr />

                {/* ======================================
                    SIDEBAR MENU
                ====================================== */}
                <div
                    className="
                        d-flex
                        flex-column
                        gap-2
                    "
                >

                    {menuItems.map((item) => (

                        <div key={item.key}>

                            {/* ==================================
                                NORMAL MENU ITEM
                            ================================== */}
                            {!item.children && (

                                <button
                                    onClick={() =>
                                        setActivePage({
                                            type: item.key,
                                        })
                                    }
                                    className={`
                                        sidebar-button
                                        btn
                                        d-flex
                                        align-items-center
                                        gap-3
                                        py-2
                                        w-100

                                        ${activePage.type === item.key
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
                                    {!collapsed && (
                                        <span>
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* ==================================
                                DROPDOWN MENU
                            ================================== */}
                            {item.children && (

                                <>
                                    {/* MAIN BUTTON */}
                                    <button
                                        onClick={() =>
                                            toggleMenu(item.key)
                                        }
                                        className="
                                            sidebar-button
                                            btn
                                            btn-outline-light
                                            d-flex
                                            align-items-center
                                            justify-content-between
                                            w-100
                                            py-2
                                        "
                                    >

                                        {/* LEFT */}
                                        <div
                                            className="
                                                d-flex
                                                align-items-center
                                                gap-3
                                            "
                                        >

                                            <span className="fs-5">
                                                {item.icon}
                                            </span>

                                            {!collapsed && (
                                                <span>
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* RIGHT ICON */}
                                        {!collapsed && (

                                            openMenus[item.key]
                                                ? <ChevronDown />
                                                : <ChevronRight />
                                        )}
                                    </button>

                                    {/* ==================================
                                        DROPDOWN CHILDREN
                                    ================================== */}
                                    {openMenus[item.key] &&
                                        !collapsed && (

                                            <div
                                                className="
                                                    ms-3
                                                    mt-2
                                                    d-flex
                                                    flex-column
                                                    gap-2
                                                "
                                            >

                                                {item.children.map((child) => (

                                                    <button
                                                        key={child.key}

                                                        onClick={() =>
                                                            setActivePage({
                                                                type: child.key,
                                                            })
                                                        }

                                                        className={`
                                                            btn
                                                            d-flex
                                                            align-items-center
                                                            gap-2
                                                            text-start

                                                            ${activePage.type === child.key
                                                                ? "btn-primary"
                                                                : "btn-outline-secondary"
                                                            }
                                                        `}
                                                    >

                                                        {/* ICON */}
                                                        <span>
                                                            {child.icon}
                                                        </span>

                                                        {/* LABEL */}
                                                        <span>
                                                            {child.label}
                                                        </span>

                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ======================================
                PROFILE / RESTAURANT SECTION
            ====================================== */}
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
                    onClick={() =>
                        setShowProfileMenu(!showProfileMenu)
                    }
                >

                    {/* LEFT */}
                    <div
                        className="
                            d-flex
                            align-items-center
                            gap-2
                        "
                    >

                        {/* ICON */}
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

                {/* ======================================
                    DROPDOWN MENU
                ====================================== */}
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

                        {/* TITLE */}
                        <div className="mb-2">
                            <small className="text-secondary">
                                Your Branches
                            </small>
                        </div>

                        {/* RESTAURANTS */}
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

                                {/* LEFT */}
                                <div
                                    className="
                                        d-flex
                                        align-items-center
                                        gap-2
                                    "
                                >

                                    {/* ACTIVE ICON */}
                                    {activeRestaurant?.id === restaurant.id && (
                                        <CheckCircleFill className="text-success" />
                                    )}

                                    {/* NAME */}
                                    <div
                                        style={{
                                            cursor: "pointer",
                                        }}

                                        onClick={() =>
                                            setActivePage({
                                                type: "restaurant-profile",
                                                restaurant,
                                            })
                                        }
                                    >

                                        <div className="small fw-semibold">
                                            {restaurant.name}
                                        </div>

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

                                {/* ACTION */}
                                <button
                                    className="
                                        btn
                                        btn-sm
                                        btn-outline-primary
                                    "
                                    onClick={() =>
                                        handleSwitchRestaurant(restaurant)
                                    }
                                >
                                    Switch
                                </button>
                            </div>
                        ))}

                        {/* CREATE BUTTON */}
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