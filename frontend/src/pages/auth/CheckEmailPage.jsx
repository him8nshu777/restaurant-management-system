import { useLocation } from "react-router-dom";

/**
 * PAGE: CheckEmailPage
 * PURPOSE:
 * After successful registration, user is redirected here.
 * It shows a message telling user to verify their email.
 *
 * FLOW:
 * RegisterPage → API → Backend sends email → redirect here
 */
export default function CheckEmailPage() {

  // React Router state carries email from RegisterPage navigation
  const location = useLocation();

  // Extract email passed from registration page (optional chaining used for safety)
  const email = location.state?.email;

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
      <h2 className="fw-bold text-success mb-3">
        Verify Your Email
      </h2>

      <p className="text-muted">
        Verification email sent to:
      </p>

      <h5 className="fw-semibold mb-3">
        {email}
      </h5>

      <p className="mb-0">
        Please check your inbox and click
        the verification link to activate
        your account.
      </p>
    </div>
  </div>
);
}