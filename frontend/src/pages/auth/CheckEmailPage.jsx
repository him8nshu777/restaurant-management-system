import { useLocation }
from "react-router-dom";


export default function CheckEmailPage() {

  const location =
    useLocation();

  const email =
    location.state?.email;


  return (

    <div>

      <h1>
        Verify Your Email
      </h1>

      <p>
        Verification email sent to:
      </p>

      <h3>
        {email}
      </h3>

      <p>
        Please check your inbox.
      </p>

    </div>
  );
}