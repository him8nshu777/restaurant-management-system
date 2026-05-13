import { useState } from "react";

import axiosInstance from "../../api/axios";
import ButtonLoader from "../../components/common/ButtonLoader";

/**
 * PAGE: ForgotPasswordPage
 * PURPOSE:
 * Allows user to request a password reset link via email.
 *
 * FLOW:
 * User enters email → API call → backend sends reset email link
 */
export default function ForgotPasswordPage() {

  // Stores user email input
  const [email, setEmail] = useState("");

  // Controls loading state for button (prevents multiple submissions)
  const [loading, setLoading] = useState("");

  /**
   * Handles forgot password request
   * Sends email to backend to generate reset link
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {

      // API call to backend forgot password endpoint
      const response = await axiosInstance.post(
        "/auth/forgot-password/",
        { email }
      );

      // Show success message returned by backend
      alert(response.data.message);

    } catch (error) {

      // Show backend error message OR fallback error
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

      <h1>Forgot Password</h1>

      {/* Forgot password form */}
      <form onSubmit={handleSubmit}>

        {/* Email input field */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Submit button with loading state */}
        <button type="submit" disabled={loading}>
          {loading ? <ButtonLoader /> : "Send Reset Link"}
        </button>

      </form>

    </div>
  );
}