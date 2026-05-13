// React Router navigation helpers
import {
  Navigate,
  useNavigate,
} from "react-router-dom";


// Redux hooks for state management
import {
  useSelector,
  useDispatch,
} from "react-redux";


// React hooks
import {
  useEffect,
  useState,
} from "react";


// Redux action to update auth state
import {
  loginSuccess,
} from "../../auth/authSlice";


// API call to fetch latest user data
import {
  getCurrentUser,
} from "../../auth/authService";


// ==========================================
// HOME PAGE (PUBLIC LANDING PAGE)
// ==========================================
// This page is the entry point of the application.
//
// Responsibilities:
// 1. Show landing page for guest users
// 2. Detect if user is already logged in
// 3. Fetch latest user data from backend
// 4. Redirect user based on restaurant status
//    - active   → dashboard
//    - pending  → account status page
// ==========================================
export default function HomePage() {

  const navigate =
    useNavigate();

  // Controls loading state while
  // checking authentication
  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const dispatch =
    useDispatch();

  // Get auth state from Redux store
  const {
    isAuthenticated,
    user,
  } = useSelector(
    (state) => state.auth
  );


  // ==========================================
  // CHECK USER AUTH STATUS ON PAGE LOAD
  // ==========================================
  useEffect(() => {

    const fetchUser =
      async () => {

        // If user is not logged in,
        // stop checking immediately
        if (!isAuthenticated) {
          setCheckingAuth(false);
          return;
        }

        try {

          // Fetch latest user data
          // from backend (/auth/me/)
          const user =
            await getCurrentUser();

          // Update Redux store with fresh data
          dispatch(
            loginSuccess({

              access:
                localStorage.getItem("access"),

              refresh:
                localStorage.getItem("refresh"),

              user,
            })
          );

        } catch (error) {

          // If token is invalid or expired,
          // user should be treated as logged out
          console.log(error);
        } finally {

          // Stop loading state
          setCheckingAuth(false);
        }
      };

    fetchUser();

  }, [isAuthenticated, dispatch]);


  // ==========================================
  // LOADING STATE
  // ==========================================
  if (checkingAuth) {

    return <h1>Loading...</h1>;
  }


  // ==========================================
  // REDIRECT LOGIC (AUTHENTICATED USERS)
  // ==========================================
  if (isAuthenticated) {

    const status =
      user?.restaurant_status;

    // If restaurant is active → go dashboard
    if (status === "active") {

      return (
        <Navigate to="/admin" />
      );
    }

    // Otherwise go to status page
    return (
      <Navigate
        to="/account-status"
        state={{
          status,
        }}
      />
    );
  }


  // ==========================================
  // GUEST LANDING PAGE UI
  // ==========================================
  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent:
          "center",
        alignItems:
          "center",
        gap: "20px",
      }}
    >

      <h1>
        Restaurant Management System
      </h1>

      <p>
        POS • Kitchen • Inventory • Reports
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >

        <button
          onClick={() =>
            navigate("/login")
          }
        >
          Login
        </button>

        <button
          onClick={() =>
            navigate("/register")
          }
        >
          Register Restaurant
        </button>

      </div>

    </div>
  );
}