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