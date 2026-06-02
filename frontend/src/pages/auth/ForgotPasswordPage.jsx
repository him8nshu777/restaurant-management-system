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
      const response = await axiosInstance.post("/auth/forgot-password/", {
        email,
      });

      // Show success message returned by backend
      alert(response.data.message);
    } catch (error) {
      // Show backend error message OR fallback error
      alert(error.response?.data?.message || "Something went wrong");
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
        <div className="text-center mb-4">
          <h2 className="fw-bold">Forgot Password</h2>

          <p className="text-muted">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email</label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="
            btn
            btn-success
            w-100
          "
            disabled={loading}
          >
            {loading ? <ButtonLoader /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
