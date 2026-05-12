import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import { loginUser } from "../../services/authService";

import { loginSuccess } from "../../auth/authSlice";
import ButtonLoader from "../../components/common/ButtonLoader";


export default function LoginPage() {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [loading, setLoading] = useState("");

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      const response =
        await loginUser(
          formData.email,
          formData.password
        );

      console.log(response);

      dispatch(
        loginSuccess({
          access: response.access,
          refresh: response.refresh,
          user:  response.user,
        })
      );

      const restaurantStatus = response.user.restaurant_status;

      if (
        restaurantStatus === "pending" ||
        restaurantStatus === "rejected" ||
        restaurantStatus === "suspended"
      ) {

        navigate(
          "/account-status",
          {
            state: {
              status: restaurantStatus,
            },
          }
        );

      } else if (
        restaurantStatus === "active"
      ) {

        navigate("/admin");

      }

    } catch (error) {

      alert(
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        "Something went wrong"
      );
    } finally {

      setLoading(false);
    }
  };


  return (

    <div>

      <h1>Login</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit"
          disabled={loading}
        >
          {
            loading
              ? <ButtonLoader />
              : "Login"
          }

        </button>

      </form>

      <p
        onClick={() =>
          navigate("/forgot-password")
        }
        style={{
          cursor: "pointer",
          color: "blue",
        }}
      >
        Forgot Password?
      </p>
    </div>
  );
}