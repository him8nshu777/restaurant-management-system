import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import { loginUser } from "../../services/authService";

import { loginSuccess } from "../../auth/authSlice";

import ButtonLoader from "../../components/common/ButtonLoader";

// ==========================================
// RESTAURANT LOGIN PAGE
// ==========================================
export default function LoginPage() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // ==========================================
  // LOADING STATE
  // ==========================================
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    email: "",

    password: "",
  });

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // HANDLE LOGIN
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await loginUser(formData.email, formData.password);

      dispatch(
        loginSuccess({
          access: response.access,

          refresh: response.refresh,

          user: response.user,
        }),
      );

      const restaurantStatus = response.user.restaurant_status;

      if (
        restaurantStatus === "pending" ||
        restaurantStatus === "rejected" ||
        restaurantStatus === "suspended"
      ) {
        navigate("/account-status", {
          state: {
            status: restaurantStatus,
          },
        });
      } else if (restaurantStatus === "active") {
        const role = response.user.role;

        switch (role) {
          case "restaurant_admin":
            navigate("/admin");
            break;

          case "cashier":
            navigate("/pos");
            break;

          case "manager":
            navigate("/manager");
            break;

          case "waiter":
            navigate("/waiter");
            break;

          case "kitchen":
            navigate("/kitchen");
            break;

          case "delivery":
            navigate("/delivery");
            break;

          default:
            navigate("/login");
        }
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data?.non_field_errors?.[0] ||
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        container-fluid
        min-vh-100
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
          p-4
          p-md-5
        "
        style={{
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {/* TITLE */}
        <div className="text-center mb-4">
          <h2
            className="
              fw-bold
            "
          >
            Restaurant Login
          </h2>

          <p className="text-muted">Login to manage your restaurant</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label">Email</label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="form-label">Password</label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="
              btn
              btn-primary
              w-100
            "
            disabled={loading}
          >
            {loading ? <ButtonLoader /> : "Login"}
          </button>
        </form>

        {/* LINKS */}
        <div className="text-center mt-4">
          <p className="mb-2">
            <span
              style={{
                cursor: "pointer",
                color: "#0d6efd",
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </p>

          <p className="mb-0">Don't have a restaurant account? </p>
          <Link to="/register">Register Restaurant</Link>
        </div>
      </div>
    </div>
  );
}
