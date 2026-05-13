import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loginUser } from "../../services/authService";
import { loginSuccess } from "../../auth/authSlice";

import ButtonLoader from "../../components/common/ButtonLoader";

/**
 * PAGE: LoginPage
 * PURPOSE:
 * Authenticates restaurant owner/admin user.
 *
 * FLOW:
 * Login → Backend JWT → Redux store → redirect based on restaurant status
 */
export default function LoginPage() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // loading state for login button
  const [loading, setLoading] = useState("");

  // login form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * Handles input changes for login form
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handles login API call and routing logic
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      // Call backend login API
      const response = await loginUser(
        formData.email,
        formData.password
      );

      console.log(response);

      /**
       * Save user + token in Redux + localStorage
       */
      dispatch(
        loginSuccess({
          access: response.access,
          refresh: response.refresh,
          user: response.user,
        })
      );

      // Extract restaurant approval status
      const restaurantStatus =
        response.user.restaurant_status;

      /**
       * ROUTING LOGIC BASED ON STATUS:
       * pending → show approval page
       * rejected/suspended → show status page
       * active → dashboard
       */
      if (
        restaurantStatus === "pending" ||
        restaurantStatus === "rejected" ||
        restaurantStatus === "suspended"
      ) {
        navigate("/account-status", {
          state: { status: restaurantStatus },
        });

      } else if (restaurantStatus === "active") {

        // ==========================================
        // ROLE-BASED ROUTING
        // ==========================================
        const role = response.user.role;

        switch (role) {

          case "restaurant_admin":
            navigate("/admin");
            break;

          case "cashier":
            navigate("/cashier");
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

            // Unknown role fallback
            navigate("/login");
        }
      }

    } catch (error) {

      // Show backend error message OR fallback message
      alert(
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div>

      <h1>Login</h1>

      {/* LOGIN FORM */}
      <form onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* Submit button with loading state */}
        <button type="submit" disabled={loading}>
          {loading ? <ButtonLoader /> : "Login"}
        </button>

      </form>

      {/* Forgot password navigation */}
      <p
        onClick={() => navigate("/forgot-password")}
        style={{ cursor: "pointer", color: "blue" }}
      >
        Forgot Password?
      </p>

    </div>
  );
}