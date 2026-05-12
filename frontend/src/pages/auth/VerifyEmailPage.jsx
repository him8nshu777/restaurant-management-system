import { useEffect, useState }
from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import axiosInstance
from "../../api/axios";


export default function VerifyEmailPage() {

  const { uid, token } =
    useParams();

  const navigate =
    useNavigate();

  const [message, setMessage] =
    useState("Verifying Email...");


  useEffect(() => {

    verifyEmail();

  }, []);


  const verifyEmail = async () => {

    try {

      const response =
        await axiosInstance.get(
          `/auth/verify-email/${uid}/${token}/`
        );

      setMessage(
        response.data.message
      );

      setTimeout(() => {

        navigate("/login");

      }, 3000);

    } catch (error) {

      setMessage(
        "Verification Failed"
      );
    }
  };


  return (

    <div>

      <h1>
        {message}
      </h1>

      <p>
        Redirecting to login...
      </p>

    </div>
  );
}