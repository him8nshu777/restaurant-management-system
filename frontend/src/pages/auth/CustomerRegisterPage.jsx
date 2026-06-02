// React hooks
import { useState } from "react";

// React Router
import { Link, useNavigate } from "react-router-dom";

// API service
import { customerRegister } from "../../services/authService";

// Loader
import ButtonLoader from "../../components/common/ButtonLoader";

// ==========================================
// CUSTOMER REGISTER PAGE
// ==========================================
export default function CustomerRegisterPage() {
  const navigate = useNavigate();

  // ==========================================
  // LOADING STATE
  // ==========================================
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    username: "",

    email: "",

    phone: "",

    password: "",

    confirm_password: "",
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
  // SUBMIT FORM
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match validation
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");

      return;
    }

    setLoading(true);

    try {
      // API CALL
      await customerRegister({
        username: formData.username,

        email: formData.email,

        phone: formData.phone,

        password: formData.password,
      });

      // Redirect to customer login
      navigate("/check-email", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Registration failed");
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
        py-5
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
          maxWidth: "500px",
        }}
      >
        {/* TITLE */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">Create Customer Account</h2>

          <p className="text-muted">
            Order food from your favorite restaurants
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <div className="mb-3">
            <label className="form-label">Username</label>

            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Enter username"
              onChange={handleChange}
              required
            />
          </div>

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

          {/* PHONE */}
          <div className="mb-3">
            <label className="form-label">Phone</label>

            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="Enter phone number"
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
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

          {/* CONFIRM PASSWORD */}
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>

            <input
              type="password"
              name="confirm_password"
              className="form-control"
              placeholder="Confirm password"
              onChange={handleChange}
              required
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="
              btn
              btn-success
              w-100
            "
            disabled={loading}
          >
            {loading ? <ButtonLoader /> : "Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <div className="text-center mt-4">
          <p className="mb-0">
            Already have an account? <Link to="/customer/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
