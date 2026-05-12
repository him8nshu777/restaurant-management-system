import {
  useNavigate,
  Navigate,
} from "react-router-dom";

import {
  useSelector,
  useDispatch,
} from "react-redux";

import {
  useEffect,
  useState,
} from "react";

import {
  loginSuccess,
  logout,
} from "../../auth/authSlice";

import {
  getCurrentUser,
} from "../../auth/authService";

import ButtonLoader from "../../components/common/ButtonLoader";


export default function AccountStatusPage() {

  const navigate =
    useNavigate();

  const dispatch =
    useDispatch();

  const {
    user,
    access,
    refresh,
  } = useSelector(
    (state) => state.auth
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    currentUser,
    setCurrentUser
  ] = useState(user);


  useEffect(() => {

    const fetchLatestUser =
      async () => {

        try {

          const latestUser =
            await getCurrentUser();

          setCurrentUser(
            latestUser
          );

          dispatch(
            loginSuccess({

              access,

              refresh,

              user: latestUser,
            })
          );

        } catch (error) {

          console.log(error);

          dispatch(logout());

          navigate("/login");
        } finally {

          setLoading(false);
        }
      };

    fetchLatestUser();

  }, []);


  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ButtonLoader />
      </div>
    );
  }


  const status =
    currentUser?.restaurant_status;


  if (status === "active") {

    return <Navigate to="/admin" />;
  }


  const statusConfig = {

    pending: {

      title:
        "Approval Pending",

      icon: "⏳",

      message:
        "Your restaurant account is currently under review.",

      boxColor: "#f1f5ff",
    },

    rejected: {

      title:
        "Account Rejected",

      icon: "❌",

      message:
        "Your restaurant registration request was rejected.",

      boxColor: "#fff1f2",
    },

    suspended: {

      title:
        "Account Suspended",

      icon: "🚫",

      message:
        "Your restaurant account has been suspended.",

      boxColor: "#fff7ed",
    },
  };


  const currentStatus =
    statusConfig[status];


  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
        padding: "20px",
      }}
    >

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >

        <div
          style={{
            fontSize: "60px",
            marginBottom: "20px",
          }}
        >
          {currentStatus?.icon}
        </div>

        <h1>
          {currentStatus?.title}
        </h1>

        <p
          style={{
            color: "#555",
            lineHeight: "1.6",
            marginTop: "16px",
          }}
        >
          {currentStatus?.message}
        </p>

        <div
          style={{
            background:
              currentStatus?.boxColor,

            padding: "16px",

            borderRadius: "8px",

            marginTop: "24px",

            fontSize: "14px",
          }}
        >
          Contact support if you need
          assistance.
        </div>

        <button
          onClick={() =>
            navigate("/login")
          }
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