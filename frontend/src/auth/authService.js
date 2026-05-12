import axiosInstance from "../api/axios";

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

export const loginUser = async (
  email,
  password
) => {

  const response =
    await axiosInstance.post(
      "/auth/login/",
      {
        username: email,
        password,
      }
    );

  return response.data;
};

export const getCurrentUser =
  async () => {

    const response =
      await axiosInstance.get(
        "/auth/me/"
      );

    return response.data;
};