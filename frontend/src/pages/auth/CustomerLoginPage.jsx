// React hooks
import { useState } from "react";

// React Router
import { Link, useNavigate } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";

// Auth slice
import { loginSuccess } from "../../auth/authSlice";

// API
import { customerLogin } from "../../services/authService";

// Loader
import ButtonLoader from "../../components/common/ButtonLoader";

// ==========================================
// CUSTOMER LOGIN PAGE
// ==========================================
export default function CustomerLoginPage() {
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
      // API CALL
      const response = await customerLogin(
        formData.email,

        formData.password,
      );

      // SAVE AUTH
      dispatch(
        loginSuccess({
          access: response.access,

          refresh: response.refresh,

          user: response.user,
        }),
      );

      // REDIRECT CUSTOMER
      navigate("/customer");
    } catch (error) {
      console.log(error);

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
          <h2 className="fw-bold">Customer Login</h2>

          <p className="text-muted">Login to order food online</p>
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
              btn-success
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
                color: "blue",
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </p>

          <p className="mb-0">
            Don't have an account?{" "}
            <Link to="/customer/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
