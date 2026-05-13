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

    <div>

      <h1>
        Restaurant Registration
      </h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          type="text"
          name="restaurant_name"
          placeholder="Restaurant Name"
          onChange={handleChange}
        />

        <input
          type="text"
          name="gst_number"
          placeholder="GST Number"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
        >
          {
            loading
              ? <ButtonLoader />
              : "Register"
          }
        </button>

      </form>

    </div>
  );
}