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

    <div>

      {/* Page heading */}
      <h1>Verify Your Email</h1>

      {/* Instruction text */}
      <p>Verification email sent to:</p>

      {/* Display registered email */}
      <h3>{email}</h3>

      <p>
        Please check your inbox and click the verification link.
      </p>

    </div>
  );
}