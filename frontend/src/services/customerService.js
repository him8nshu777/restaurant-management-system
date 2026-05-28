import axiosInstance from "../api/axios";


// ==========================================
// UPDATE CUSTOMER LOCATION
// ==========================================
export const updateCustomerLocation = async (
  data
) => {

  const response =
    await axiosInstance.patch(
      "/customers/location/",
      data
    );

  return response.data;
};

// ==========================================
// GET NEARBY RESTAURANTS
// ==========================================
export const getNearbyRestaurants =
  async (params) => {

  const response =
    await axiosInstance.get(
      "/customers/restaurants/nearby/",
      {
        params,
      }
    );

  return response.data;
};