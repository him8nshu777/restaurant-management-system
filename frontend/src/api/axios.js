import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use(

  (config) => {

     const publicUrls = [
      "/auth/login/",
      "/auth/customer/login/",
      "/auth/register/",
      "/auth/customer/register/",
    ];
    const isPublic = publicUrls.some(
      (url) => config.url?.includes(url)
    );

    if (!isPublic) {
    const token =
      localStorage.getItem(
        "access"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }
  }

    return config;
  },

  (error) => {

    return Promise.reject(error);
  }
);


export default axiosInstance;