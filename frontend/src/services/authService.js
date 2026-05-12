import axiosInstance from "../api/axios";


export const loginUser = async (
  email,
  password
) => {

  const response =
    await axiosInstance.post(
      "/auth/login/",
      {
        email,
        password,
      }
    );

  return response.data;
};

export const registerUser = async (
  data
) => {

  const response =
    await axiosInstance.post(
      "/auth/register/",
      data
    );

  return response.data;
};