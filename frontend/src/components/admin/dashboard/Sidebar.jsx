import { useState, useEffect } from "react";

import {
  List,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  CheckCircleFill,
  Building,
  PersonCircle,
} from "react-bootstrap-icons";

import { getRestaurants } from "../../../services/adminService";

import "./sidebar.css";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../auth/authSlice";
import { logoutUser } from "../../../services/authService";
import { setActiveRestaurant } from "../../../features/restaurants/restaurantSlice";

import { getMenuByRole } from "./menuConfig";
import { useNavigate } from "react-router-dom";
// ==========================================
// REUSABLE SIDEBAR
// ==========================================
export default function Sidebar({ activePage, setActivePage}) {
  const navigate = useNavigate();

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
  const [openMenus, setOpenMenus] = useState({});

  // ==========================================
  // RESTAURANTS
  // ==========================================
  const [restaurants, setRestaurants] = useState([]);

  const dispatch = useDispatch();

  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ==========================================
  // AUTH USER
  // ==========================================
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {

  const confirmed =
    window.confirm(
      "Are you sure you want to logout?"
    );

  if (!confirmed) return;

  try {

    await logoutUser(
      user?.session_key
    );

  } catch (error) {

    console.log(error);

  } finally {

    dispatch(logout());

    localStorage.clear();

    navigate("/");
  }
};

  // ==========================================
  // ROLE BASED MENU
  // ==========================================
  const menuItems = getMenuByRole(user?.role || "restaurant_admin");

  // ==========================================
  // ROLE CHECK
  // ==========================================
  const isRestaurantAdmin = user?.role === "restaurant_admin";

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
    dispatch(setActiveRestaurant(restaurant));

    // ======================================
    // SAVE IN LOCAL STORAGE
    // ======================================
    localStorage.setItem("activeRestaurant", JSON.stringify(restaurant));

    // ======================================
    // RELOAD DASHBOARD
    // ======================================
    window.location.reload();
  };
  console.log("ROLE:", user?.role);
  console.log("MENU:", menuItems);
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
      if (data.length > 0 && !activeRestaurant) {
        dispatch(setActiveRestaurant(data[0]));

        localStorage.setItem("activeRestaurant", JSON.stringify(data[0]));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // RENDER MENU ITEMS
  // ==========================================
  const renderMenuItems = (items, isChild = false) => {
    return items.map((item) => (
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
              btn
              d-flex
              align-items-center
              gap-${isChild ? "2" : "3"}
              py-2
              text-start
              w-100

              ${
                isChild
                  ? activePage.type === item.key
                    ? "btn-primary"
                    : "btn-outline-secondary"
                  : activePage.type === item.key
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
        )}

        {/* ==================================
            DROPDOWN MENU
        ================================== */}
        {item.children && (
          <>
            {/* MAIN BUTTON */}
            <button
              onClick={() => toggleMenu(item.key)}
              className={`
                btn
                d-flex
                align-items-center
                justify-content-between
                w-100
                py-2

                ${isChild ? "btn-outline-secondary" : "btn-outline-light"}
              `}
            >
              {/* LEFT */}
              <div
                className="
                  d-flex
                  align-items-center
                  gap-3
                "
              >
                <span className="fs-5">{item.icon}</span>

                {!collapsed && <span>{item.label}</span>}
              </div>

              {/* RIGHT ICON */}
              {!collapsed &&
                (openMenus[item.key] ? <ChevronDown /> : <ChevronRight />)}
            </button>

            {/* ==================================
                DROPDOWN CHILDREN
            ================================== */}
            {openMenus[item.key] && !collapsed && (
              <div
                className="
                    ms-3
                    mt-2
                    d-flex
                    flex-column
                    gap-2
                  "
              >
                {renderMenuItems(item.children, true)}
              </div>
            )}
          </>
        )}
      </div>
    ));
  };

  return (
    <div
      className={`
        sidebar
        text-white
        p-3
        d-flex
        flex-column
        ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}
      `}
    >
      {/* ======================================
          TOP SECTION
      ====================================== */}
      <div className="
    d-flex
    flex-column
    flex-grow-1
    overflow-hidden
  "
  style={{ minHeight: 0 }}>
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
          {!collapsed && <h4 className="fw-bold mb-0">ERP</h4>}

          {/* COLLAPSE BUTTON */}
          <button
            className="
              btn
              btn-outline-light
              btn-sm
            "
            onClick={() => setCollapsed(!collapsed)}
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
            flex-grow-1
    sidebar-menu-scroll
          "
        >
          {renderMenuItems(menuItems)}
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
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          {/* LEFT */}
          <div
            className="
              d-flex
              align-items-center
              gap-2
            "
          >
            {isRestaurantAdmin ? (
              <>
                <Building size={18} />

                {!collapsed && (
                  <div className="text-start">
                    <div className="small fw-bold">
                      {activeRestaurant?.name}
                    </div>

                    <div className="text-secondary small">Branch</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <PersonCircle size={18} />

                {!collapsed && (
                  <div className="text-start">
                    <div className="small fw-bold">{user?.username}</div>

                    <div className="text-secondary small text-capitalize">
                      {user?.role?.replace("_", " ")}
                    </div>
                  </div>
                )}
              </>
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
            {/* ==================================
                  ONLY ADMIN CAN SWITCH BRANCH
              ================================== */}
            {isRestaurantAdmin ? (
              <>
                <div className="mb-2">
                  <button
                    className="
      btn
      btn-outline-light
      w-100
      text-start
    "
                    onClick={() =>
                      setActivePage({
                        type: "profile",
                      })
                    }
                  >
                    <PersonCircle className="me-2" />
                    My Profile
                  </button>

                  <button
                    className="
    btn
    btn-outline-danger
    w-100
    text-start
    mt-2
  "
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
                {/* TITLE */}
                <div className="mb-2">
                  <small className="text-secondary">Your Branches</small>
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
                      onClick={() => handleSwitchRestaurant(restaurant)}
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
              </>
            ) : (
              <>
                <button
                  className="
      btn
      btn-outline-light
      w-100
      text-start
      mb-2
    "
                  onClick={() =>
                    setActivePage({
                      type: "profile",
                    })
                  }
                >
                  <PersonCircle className="me-2" />
                  My Profile
                </button>

                <button
                  className="
    btn
    btn-outline-danger
    w-100
    text-start
    mt-2
  "
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
