import { useState }
from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import axiosInstance
from "../../api/axios";
import ButtonLoader from "../../components/common/ButtonLoader";


export default function ResetPasswordPage() {

  const { uid, token } =
    useParams();

  const navigate =
    useNavigate();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [message, setMessage] =
    useState("");
    const [loading, setLoading] = useState("");


  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);


    if (
      password !== confirmPassword
    ) {

      setMessage(
        "Passwords do not match"
      );

      return;
    }

    try {

      const response =
        await axiosInstance.post(
          `/auth/reset-password/${uid}/${token}/`,
          {
            password,
          }
        );

      alert(
  "Password reset successful"
);

navigate("/login");

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
        Reset Password
      </h1>

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button type="submit"
            disabled={loading}
        >
            {
                        loading
                        ? <ButtonLoader />
                        : "Reset Password"
                    }
        </button>

      </form>

    </div>
  );
}