// React Router navigation helpers
import { Navigate, useNavigate } from "react-router-dom";

// Redux hooks
import { useSelector, useDispatch, connect } from "react-redux";

// React hooks
import { useEffect, useState } from "react";

// Redux auth action
import { loginSuccess } from "../../auth/authSlice";

// Fetch latest authenticated user
import { getCurrentUser } from "../../auth/authService";

// ==========================================
// HOME PAGE
// ==========================================
// RESPONSIBILITIES:
// 1. Public landing page
// 2. Auto-login redirect
// 3. Role-based routing
// 4. Restaurant status checking
// ==========================================
export default function HomePage() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // ==========================================
  // REDUX AUTH STATE
  // ==========================================
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // ==========================================
  // LOADING STATE
  // ==========================================
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ==========================================
  // FETCH CURRENT USER
  // ==========================================
  useEffect(() => {
    const fetchUser = async () => {
      // If not authenticated stop loading
      if (!isAuthenticated) {
        setCheckingAuth(false);

        return;
      }

      try {
        // Fetch latest user details
        const user = await getCurrentUser();

        // Update Redux store
        dispatch(
          loginSuccess({
            access: localStorage.getItem("access"),

            refresh: localStorage.getItem("refresh"),

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
  // LOADING SCREEN
  // ==========================================
  if (checkingAuth) {
    return (
      <div
        className="
          d-flex
          justify-content-center
          align-items-center
          vh-100
        "
      >
        <h3>Loading...</h3>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED USER REDIRECT
  // ==========================================
  if (isAuthenticated) {
    const role = user?.role;
    console.log("role",role)
    if (role === "customer") {
      return <Navigate to="/customer" />;
    }
    const restaurantStatus = user?.restaurant_status;

    // ==========================================
    // BLOCKED RESTAURANT STATES
    // ==========================================
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

    // ==========================================
    // ACTIVE RESTAURANT
    // ROLE-BASED ROUTING
    // ==========================================
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

  // ==========================================
  // PUBLIC LANDING PAGE
  // ==========================================
  return (
    <div
      className="
        container-fluid
        vh-100
        d-flex
        justify-content-center
        align-items-center
        bg-light
      "
    >
      <div
        className="
          card
          border-0
          shadow
          p-5
          text-center
        "
        style={{
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {/* APP TITLE */}
        <h1 className="fw-bold mb-3">Restaurant ERP</h1>

        {/* SUBTITLE */}
        <p className="text-muted mb-4">
          POS • Kitchen • Billing • Staff • Reports
        </p>

        {/* ACTION BUTTONS */}
        <div className="mb-5">

  <h4 className="fw-bold mb-3">
    Order Food Online
  </h4>

  <p className="text-muted mb-4">
    Browse nearby restaurants and order food
  </p>

  <div
    className="
      d-flex
      flex-column
      gap-3
      justify-content-center
    "
  >

    {/* BROWSE RESTAURANTS */}
    <button
      className="btn btn-success px-4"
      onClick={() =>
        navigate("/customer")
      }
    >
      Browse Restaurants
    </button>


    {/* CUSTOMER LOGIN */}
    <button
      className="btn btn-outline-success px-4"
      onClick={() =>
        navigate("/customer/login")
      }
    >
      Customer Login
    </button>


    {/* CUSTOMER REGISTER */}
    <button
      className="btn btn-outline-secondary px-4"
      onClick={() =>
        navigate("/customer/register")
      }
    >
      Create Customer Account
    </button>

  </div>

</div>

        <hr className="my-4" />

        <div>
          <h4 className="fw-bold mb-3">Restaurant ERP</h4>

          <p className="text-muted mb-4">
            POS • Kitchen • Billing • Staff • Reports
          </p>

          <div
            className="
      d-flex
      flex-column
      flex-sm-row
      gap-3
      justify-content-center
    "
          >
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/login")}
            >
              Staff Login
            </button>

            <button
              className="btn btn-outline-dark px-4"
              onClick={() => navigate("/register")}
            >
              Register Restaurant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
