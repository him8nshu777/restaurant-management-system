import axiosInstance from "../api/axios";

// ==========================================
// GET POS PRODUCTS
// ==========================================
export const getPOSProducts = async (
  restaurantId,
  filters = {}
) => {

  const params = new URLSearchParams({
    restaurant_id: restaurantId,
  });

  // CATEGORY
  if (filters.category_id) {
    params.append(
      "category_id",
      filters.category_id
    );
  }

  // SEARCH
  if (filters.search) {
    params.append(
      "search",
      filters.search
    );
  }

  // VEG FILTER
  if (filters.is_veg) {
    params.append(
      "is_veg",
      filters.is_veg
    );
  }

  const response =
    await axiosInstance.get(
      `/pos/products/?${params.toString()}`
    );

  return response.data;
};