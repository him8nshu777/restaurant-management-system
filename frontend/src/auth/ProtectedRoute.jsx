// React Router component used for navigation control
import { Navigate } from "react-router-dom";

// Redux hooks for accessing and updating auth state
import { useSelector, useDispatch } from "react-redux";

// React hooks for lifecycle and state handling
import { useEffect, useState } from "react";

// API call to fetch latest authenticated user
import { getCurrentUser } from "../auth/authService";

// Redux actions for updating auth state
import { loginSuccess, logout } from "../auth/authSlice";

// Common loader component (optional UI improvement)
import ButtonLoader from "../components/common/ButtonLoader";


// ==========================================
// PROTECTED ROUTE COMPONENT
// ==========================================
// This component protects private routes
// such as admin dashboard, orders, etc.
//
// FLOW:
// 1. Check if user is authenticated
// 2. Fetch latest user from backend (/me)
// 3. Update Redux store with latest status
// 4. Allow or block route based on status
// ==========================================

export default function ProtectedRoute({ children }) {

  const dispatch = useDispatch();

  // Get auth state from Redux store
  const { isAuthenticated, user, access, refresh } =
    useSelector((state) => state.auth);

  // Local loading state while verifying user
  const [loading, setLoading] = useState(true);


  // ==========================================
  // FETCH LATEST USER STATUS FROM BACKEND
  // ==========================================
  useEffect(() => {

    const syncUser = async () => {

      // If user is not logged in,
      // stop loading and block access
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {

        // Call backend to get latest user data
        const latestUser = await getCurrentUser();

        // Update Redux store with fresh user data
        dispatch(
          loginSuccess({
            access,
            refresh,
            user: latestUser,
          })
        );

      } catch (error) {

        // If token expired or invalid,
        // logout user completely
        dispatch(logout());
      } finally {

        // Stop loading after API response
        setLoading(false);
      }
    };

    syncUser();

  }, [dispatch, isAuthenticated, access, refresh]);


  // ==========================================
  // SHOW LOADING STATE WHILE CHECKING USER
  // ==========================================
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <ButtonLoader />
      </div>
    );
  }


  // ==========================================
  // REDIRECT IF NOT LOGGED IN
  // ==========================================
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  // ==========================================
  // BLOCK ACCESS IF RESTAURANT NOT ACTIVE
  // ==========================================
  if (user?.restaurant_status !== "active") {
    return <Navigate to="/account-status" replace />;
  }


  // ==========================================
  // ALLOW ACCESS TO PROTECTED PAGE
  // ==========================================
  return children;
}