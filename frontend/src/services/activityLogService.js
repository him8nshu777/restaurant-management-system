import axiosInstance from "../api/axios";

export const getActivityLogs = async (
  restaurantId
) => {

  const response =
    await axiosInstance.get(
      `/audits/restaurants/${restaurantId}/activity-logs/`
    );

  return response.data;
};