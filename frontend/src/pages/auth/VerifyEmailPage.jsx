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
        `/auth/verify-email/${uid}/${token}/`,
      );

      setMessage(response.data.message);

      // ==========================================
      // CUSTOMER
      // ==========================================
      if (response.data.role === "customer") {
        setTimeout(() => {
          navigate("/customer/login");
        }, 3000);
      }

      // ==========================================
      // RESTAURANT / STAFF
      // ==========================================
      else {
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      // If verification fails (expired/invalid link)
      setMessage("Verification Failed. Link is invalid or expired.");
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
        text-center
      "
        style={{
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h2 className="fw-bold text-primary">{message}</h2>

        <p className="text-muted mt-3 mb-0">Redirecting...</p>
      </div>
    </div>
  );
}
