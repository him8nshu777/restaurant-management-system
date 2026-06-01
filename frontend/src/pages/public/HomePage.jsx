// React Router navigation helpers
import { Navigate, useNavigate } from "react-router-dom";

// Redux hooks
import { useSelector, useDispatch } from "react-redux";

// React hooks
import { useEffect, useState } from "react";

// Redux auth action
import { loginSuccess } from "../../auth/authSlice";

// Fetch latest authenticated user
import { getCurrentUser } from "../../auth/authService";

export default function HomePage() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(
    (state) => state.auth,
  );

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        setCheckingAuth(false);
        return;
      }

      try {
        const user = await getCurrentUser();

        dispatch(
          loginSuccess({
            access:
              localStorage.getItem("access"),
            refresh:
              localStorage.getItem("refresh"),
            user,
          }),
        );
      } catch (error) {
        console.log(error);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, dispatch]);

  // ==========================================
  // LOADING
  // ==========================================
  if (checkingAuth) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <h3>Loading...</h3>
      </div>
    );
  }

  // ==========================================
  // AUTH REDIRECTS
  // ==========================================
  if (isAuthenticated) {
    const role = user?.role;

    if (role === "customer") {
      return <Navigate to="/customer" />;
    }

    const restaurantStatus =
      user?.restaurant_status;

    if (
      restaurantStatus === "pending" ||
      restaurantStatus === "rejected" ||
      restaurantStatus === "suspended"
    ) {
      return (
        <Navigate
          to="/account-status"
          state={{
            status: restaurantStatus,
          }}
        />
      );
    }

    if (restaurantStatus === "active") {
      switch (role) {
        case "restaurant_admin":
          return <Navigate to="/admin" />;

        case "cashier":
          return <Navigate to="/cashier" />;

        case "manager":
          return <Navigate to="/manager" />;

        case "waiter":
          return <Navigate to="/waiter" />;

        case "kitchen":
          return <Navigate to="/kitchen" />;

        case "delivery":
          return <Navigate to="/delivery" />;

        default:
          return <Navigate to="/login" />;
      }
    }
  }

  return (
    <div className="bg-light min-vh-100">
      {/* HERO */}
      <section className="py-5 bg-dark text-white">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">
            RestaurantHub
          </h1>

          <p
            className="lead mx-auto"
            style={{ maxWidth: "700px" }}
          >
            Online Food Ordering + Complete
            Restaurant Management System.
            Manage orders, billing, kitchen,
            staff, delivery and reports from
            one platform.
          </p>

          <div className="mt-4 d-flex flex-column flex-sm-row justify-content-center gap-3">
            <button
              className="btn btn-success btn-lg"
              onClick={() =>
                navigate("/customer/restaurant")
              }
            >
              Browse Restaurants
            </button>

            <button
              className="btn btn-outline-light btn-lg"
              onClick={() =>
                navigate("/register")
              }
            >
              Register Restaurant
            </button>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {/* CUSTOMER + OWNER */}
        <div className="row g-4">
          {/* CUSTOMER */}
          <div className="col-lg-6">
            <div className="card border-0 shadow h-100">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3">
                  🍔 For Customers
                </h3>

                <p className="text-muted">
                  Discover nearby restaurants,
                  browse menus and order food
                  online.
                </p>

                <ul className="list-unstyled">
                  <li>
                    ✓ Browse Restaurants
                  </li>
                  <li>
                    ✓ View Menus & Prices
                  </li>
                  <li>
                    ✓ Place Orders
                  </li>
                  <li>
                    ✓ Track Order Status
                  </li>
                  <li>
                    ✓ Order History
                  </li>
                </ul>

                <div className="d-flex flex-column gap-2 mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      navigate(
                        "/customer/restaurant",
                      )
                    }
                  >
                    Browse Restaurants
                  </button>

                  <button
                    className="btn btn-outline-success"
                    onClick={() =>
                      navigate(
                        "/customer/login",
                      )
                    }
                  >
                    Customer Login
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      navigate(
                        "/customer/register",
                      )
                    }
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RESTAURANT OWNER */}
          <div className="col-lg-6">
            <div className="card border-0 shadow h-100">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3">
                  🏪 For Restaurant Owners
                </h3>

                <p className="text-muted">
                  Manage your entire restaurant
                  operation from one dashboard.
                </p>

                <ul className="list-unstyled">
                  <li>
                    ✓ POS & Billing
                  </li>
                  <li>
                    ✓ Kitchen Order Management
                  </li>
                  <li>
                    ✓ Staff Management
                  </li>
                  <li>
                    ✓ Delivery Tracking
                  </li>
                  <li>
                    ✓ Sales Reports
                  </li>
                  <li>
                    ✓ Inventory Monitoring
                  </li>
                </ul>

                <div className="d-flex flex-column gap-2 mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate("/login")
                    }
                  >
                    Restaurant Login
                  </button>

                  <button
                    className="btn btn-outline-dark"
                    onClick={() =>
                      navigate("/register")
                    }
                  >
                    Register Restaurant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STAFF SECTION */}
        <div className="card border-0 shadow mt-5">
          <div className="card-body p-4 text-center">
            <h3 className="fw-bold mb-3">
              👥 Staff Access
            </h3>

            <p className="text-muted">
              Dedicated dashboards for every
              role in your restaurant.
            </p>

            <div className="row mt-4">
              <div className="col-md-2 col-6 mb-3">
                Cashier
              </div>

              <div className="col-md-2 col-6 mb-3">
                Manager
              </div>

              <div className="col-md-2 col-6 mb-3">
                Waiter
              </div>

              <div className="col-md-2 col-6 mb-3">
                Kitchen
              </div>

              <div className="col-md-2 col-6 mb-3">
                Delivery
              </div>

              <div className="col-md-2 col-6 mb-3">
                Admin
              </div>
            </div>

            <button
              className="btn btn-primary mt-3"
              onClick={() =>
                navigate("/login")
              }
            >
              Staff Login
            </button>
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-5">
          <h2 className="text-center fw-bold mb-4">
            Why Choose RestaurantHub?
          </h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  ⚡
                  <h5 className="mt-2">
                    Real-Time Orders
                  </h5>
                  <p className="text-muted">
                    Instant order updates
                    between customers, POS
                    and kitchen.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  💳
                  <h5 className="mt-2">
                    Fast Billing
                  </h5>
                  <p className="text-muted">
                    Integrated POS and
                    invoice generation.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  📊
                  <h5 className="mt-2">
                    Reports & Analytics
                  </h5>
                  <p className="text-muted">
                    Monitor sales,
                    performance and growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-5 py-4">
          <h5 className="fw-bold">
            RestaurantHub
          </h5>

          <p className="text-muted mb-0">
            Online Ordering • POS • Kitchen •
            Staff • Delivery • Reports
          </p>
        </div>
      </div>
    </div>
  );
}