import { useState }
from "react";

import axiosInstance
from "../../api/axios";
import ButtonLoader from "../../components/common/ButtonLoader";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
    const [loading, setLoading] = useState("");
  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      const response =
        await axiosInstance.post(
          "/auth/forgot-password/",
          {
            email,
          }
        );

      alert(
      response.data.message
    );

    } catch (error) {

      alert(
    error.response?.data?.message ||
    "Something went wrong"
  );
    }finally {

    setLoading(false);
  }
  };


  return (

    <div>

      <h1>
        Forgot Password
      </h1>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        {/* <button type="submit">
          Send Reset Link
        </button> */}
        <button
        type="submit"
        disabled={loading}
        >

        {
            loading
            ? <ButtonLoader />
            : "Send Reset Link"
        }

        </button>

      </form>


    </div>
  );
}