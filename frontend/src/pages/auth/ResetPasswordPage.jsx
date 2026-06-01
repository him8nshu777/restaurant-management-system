import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axios";
import ButtonLoader from "../../components/common/ButtonLoader";

/**
 * PAGE: ResetPasswordPage
 * PURPOSE:
 * Allows user to reset password using secure token from email link.
 *
 * FLOW:
 * Email Link → Frontend route (/reset-password/:uid/:token)
 * → API call → password updated → redirect login
 */
export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  // New password input
  const [password, setPassword] = useState("");

  // Confirm password input
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading state for submit button
  const [loading, setLoading] = useState("");

  /**
   * Handles password reset request
   * Validates password match before API call
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // Frontend validation before API call
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // API call to reset password
      await axiosInstance.post(`/auth/reset-password/${uid}/${token}/`, {
        password,
      });

      // Success feedback
      alert("Password reset successful");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      // Show backend error or fallback message
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
          <h2 className="fw-bold">Reset Password</h2>

          <p className="text-muted">Create a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password</label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>

            <input
              type="password"
              className="form-control"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <ButtonLoader /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
