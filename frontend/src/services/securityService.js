import axiosInstance from "../api/axios";

export const getActiveSessions = async (
  restaurantId
) => {

  const response =
    await axiosInstance.get(
      `/security/${restaurantId}/`
    );

  return response.data;
};


export const logoutDevice = async (
  sessionId
) => {

  const response =
    await axiosInstance.post(
      "/security/logout-device/",
      {
        session_id: sessionId,
      }
    );

  return response.data;
};

export const logoutAllDevices =
  async (
    restaurantId
  ) => {

    const response =
      await axiosInstance.post(
        "/security/logout-all-devices/",
        {
          restaurant_id:
            restaurantId,
        }
      );

    return response.data;
  };

