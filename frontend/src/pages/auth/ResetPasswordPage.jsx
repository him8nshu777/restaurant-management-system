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
      await axiosInstance.post(
        `/auth/reset-password/${uid}/${token}/`,
        { password }
      );

      // Success feedback
      alert("Password reset successful");

      // Redirect to login page
      navigate("/login");

    } catch (error) {

      // Show backend error or fallback message
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

      <h1>Reset Password</h1>

      {/* Reset password form */}
      <form onSubmit={handleSubmit}>

        {/* New password */}
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        {/* Confirm password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <br /><br />

        {/* Submit button */}
        <button type="submit" disabled={loading}>
          {loading ? <ButtonLoader /> : "Reset Password"}
        </button>

      </form>

    </div>
  );
}