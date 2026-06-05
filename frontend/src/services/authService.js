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

export const logoutUser = async (
  sessionKey
) => {

  const response =
    await axiosInstance.post(
      "/auth/logout/",
      {
        session_key: sessionKey,
      }
    );

  return response.data;
};

export const customerRegister =
  async (data) => {

  const response =
    await axiosInstance.post(
      "/auth/customer/register/",
      data
    );

  return response.data;
};

export const customerLogin =
  async (email, password) => {

  const response =
    await axiosInstance.post(
      "/auth/customer/login/",
      {
        email,
        password,
      }
    );

  return response.data;
};