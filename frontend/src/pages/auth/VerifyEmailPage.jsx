import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

/**
 * PAGE: VerifyEmailPage
 * PURPOSE:
 * Handles email verification link clicked from email.
 *
 * FLOW:
 * Email Link → Frontend Route → API call → backend verifies user → redirect login
 */
export default function VerifyEmailPage() {

  const { uid, token } = useParams(); // extracted from URL
  const navigate = useNavigate();

  // UI message state (loading / success / error)
  const [message, setMessage] = useState("Verifying Email...");

  useEffect(() => {
    verifyEmail();
  }, []);

  /**
   * Calls backend API to verify email using UID + Token
   */
  const verifyEmail = async () => {

    try {

      const response = await axiosInstance.get(
        `/auth/verify-email/${uid}/${token}/`
      );

      setMessage(response.data.message);

      // After success redirect user to login page
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error) {

      // If verification fails (expired/invalid link)
      setMessage("Verification Failed. Link is invalid or expired.");
    }
  };

  return (

    <div>

      {/* Dynamic status message */}
      <h1>{message}</h1>

      {/* Inform user about redirect */}
      <p>Redirecting to login...</p>

    </div>
  );
}