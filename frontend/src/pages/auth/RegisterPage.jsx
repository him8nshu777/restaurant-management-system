import { useState } from "react";

import {
  registerUser,
} from "../../services/authService";
import { useNavigate } from "react-router-dom";
import ButtonLoader from "../../components/common/ButtonLoader";

export default function RegisterPage() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState("");

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      phone: "",
      password: "",
      restaurant_name: "",
      gst_number: "",
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
        await registerUser(formData);

      console.log(response);

      // alert("Registration Successful");
      // navigate("/login");

      navigate(
        "/check-email",
        {
          state: {
            email: formData.email,
          },
        }
      );
    } catch (error) {

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

      <h1>Restaurant Registration</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          type="text"
          name="restaurant_name"
          placeholder="Restaurant Name"
          onChange={handleChange}
        />

        <input
          type="text"
          name="gst_number"
          placeholder="GST Number"
          onChange={handleChange}
        />

        <button type="submit"
          disabled={loading}
        >
          {
            loading
              ? <ButtonLoader />
              : "Register"
          }

        </button>

      </form>

    </div>
  );
}