// React hook for managing component state
import { useState } from "react";


// API call for registering restaurant owner
import {
  registerUser,
} from "../../services/authService";


// React Router hook for navigation
import {
  useNavigate,
} from "react-router-dom";


// Reusable loading spinner for buttons
import ButtonLoader
from "../../components/common/ButtonLoader";


// ==========================================
// REGISTER PAGE (RESTAURANT ONBOARDING)
// ==========================================
// This page allows new restaurant owners to:
// 1. Create account
// 2. Submit restaurant details
// 3. Trigger email verification flow
// 4. Redirect to "Check Email" page
// ==========================================
export default function RegisterPage() {

  const navigate =
    useNavigate();

  // Loading state for submit button
  const [
    loading,
    setLoading,
  ] = useState(false);


  // Form state for registration data
  const [formData, setFormData] =
    useState({

      username: "",

      email: "",

      phone: "",

      password: "",

      restaurant_name: "",

      gst_number: "",
    });


  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };


  // ==========================================
  // SUBMIT REGISTRATION FORM
  // ==========================================
  const handleSubmit =
    async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      // Call backend registration API
      const response =
        await registerUser(formData);

      console.log(response);

      // After successful registration:
      // DO NOT login user immediately
      // Instead move to email verification step
      navigate(
        "/check-email",
        {
          state: {
            email:
              formData.email,
          },
        }
      );

    } catch (error) {

      // Show backend error message
      alert(
        error.response?.data?.message ||
        "Something went wrong"
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
      py-4
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
        maxWidth: "550px",
      }}
    >
      {/* TITLE */}
      <div className="text-center mb-4">
        <h2
          className="
            fw-bold
            text-primary
          "
        >
          Restaurant Registration
        </h2>

        <p className="text-muted">
          Register your restaurant and start managing operations
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* USERNAME */}
        <div className="mb-3">
          <label className="form-label">
            Username
          </label>

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
          <label className="form-label">
            Email
          </label>

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
          <label className="form-label">
            Phone Number
          </label>

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
          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Enter password"
            onChange={handleChange}
            required
          />
        </div>

        {/* RESTAURANT NAME */}
        <div className="mb-3">
          <label className="form-label">
            Restaurant Name
          </label>

          <input
            type="text"
            name="restaurant_name"
            className="form-control"
            placeholder="Enter restaurant name"
            onChange={handleChange}
            required
          />
        </div>

        {/* GST NUMBER */}
        <div className="mb-4">
          <label className="form-label">
            GST Number
          </label>

          <input
            type="text"
            name="gst_number"
            className="form-control"
            placeholder="Enter GST number"
            onChange={handleChange}
          />
        </div>

        {/* REGISTER BUTTON */}
        <button
          type="submit"
          className="
            btn
            btn-primary
            w-100
          "
          disabled={loading}
        >
          {loading ? (
            <ButtonLoader />
          ) : (
            "Register Restaurant"
          )}
        </button>
      </form>

      {/* LINKS */}
      <div className="text-center mt-4">
        <p className="mb-0">
          Already have an account?{" "}
          <span
            style={{
              cursor: "pointer",
            }}
            className="text-primary"
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </span>
        </p>
      </div>
    </div>
  </div>
);
}