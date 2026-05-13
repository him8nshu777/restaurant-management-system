// Common axios instance configured
// with base backend URL and interceptors
import axiosInstance from "../api/axios";


// ==========================================
// REGISTER NEW RESTAURANT OWNER
// ==========================================
// Sends registration data to backend
// Creates:
// - User account
// - Restaurant
// - Sends verification email
export const registerUser = async (
  data
) => {

  // POST request to register API
  const response =
    await axiosInstance.post(
      "/auth/register/",
      data
    );

  // Return backend response data
  return response.data;
};


// ==========================================
// LOGIN USER
// ==========================================
// Authenticates user credentials
// and returns JWT tokens + user data
export const loginUser = async (
  email,
  password
) => {

  // Send login request to backend
  const response =
    await axiosInstance.post(
      "/auth/login/",
      {

        // Backend currently accepts
        // email in username field
        username: email,

        password,
      }
    );

  // Return login response
  return response.data;
};


// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================
// Fetches latest authenticated user
// details from backend using JWT token
export const getCurrentUser =
  async () => {

    // GET authenticated user details
    const response =
      await axiosInstance.get(
        "/auth/me/"
      );

    // Return user object
    return response.data;
};