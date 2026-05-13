import {useNavigate, Navigate, } from "react-router-dom";

import {useSelector, useDispatch, } from "react-redux";

import {useEffect, useState, } from "react";

import {loginSuccess, logout, } from "../../auth/authSlice";

import {getCurrentUser, } from "../../auth/authService";

import ButtonLoader from "../../components/common/ButtonLoader";

/**
 * PAGE: AccountStatusPage
 * PURPOSE:
 * Shows restaurant approval status after login:
 * pending | rejected | suspended | active
 *
 * FLOW:
 * Login → store user → redirect here if not active
 * → fetch latest status from backend → show updated status
 */

export default function AccountStatusPage() {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { user, access, refresh } = useSelector(
    (state) => state.auth
  );

  // Page loading state while fetching latest user status
  const [loading, setLoading] = useState(true);

  // Stores latest user data from backend (important for status refresh)
  const [currentUser, setCurrentUser] = useState(user);


  useEffect(() => {

    const fetchLatestUser = async () => {

      try {

        const latestUser = await getCurrentUser();

        setCurrentUser(latestUser);

        // Update Redux store with latest user info
        dispatch(
          loginSuccess({
            access,
            refresh,
            user: latestUser,
          })
        );

      } catch (error) {

        console.log(error);

        // If token invalid → logout user
        dispatch(logout());
        navigate("/login");

      } finally {
        setLoading(false);
      }
    };

    fetchLatestUser();

  }, []);


  // Show loader while fetching latest status
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


  // Extract restaurant status
  const status = currentUser?.restaurant_status;


  // If active → go to dashboard
  if (status === "active") {
    return <Navigate to="/admin" />;
  }

  /**
   * UI configuration for different statuses
   */
  const statusConfig = {

    pending: {
      title: "Approval Pending",
      icon: "⏳",
      message: "Your restaurant account is under review.",
      boxColor: "#f1f5ff",
    },

    rejected: {
      title: "Account Rejected",
      icon: "❌",
      message: "Your restaurant request was rejected.",
      boxColor: "#fff1f2",
    },

    suspended: {
      title: "Account Suspended",
      icon: "🚫",
      message: "Your account has been suspended.",
      boxColor: "#fff7ed",
    },
  };
  


  const currentStatus = statusConfig[status];


  return (

    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f7fb",
      padding: "20px",
    }}>

      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>

        {/* Status icon */}
        <div style={{ fontSize: "60px" }}>
          {currentStatus?.icon}
        </div>

        {/* Status title */}
        <h1>{currentStatus?.title}</h1>

        {/* Status message */}
        <p style={{
          color: "#555",
          marginTop: "16px",
          lineHeight: "1.6"
        }}>
          {currentStatus?.message}
        </p>

        {/* Info box */}
        <div style={{
          background: currentStatus?.boxColor,
          padding: "16px",
          borderRadius: "8px",
          marginTop: "24px",
          fontSize: "14px",
        }}>
          Contact support if you need assistance.
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "24px",
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}