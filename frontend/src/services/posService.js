import axiosInstance from "../api/axios";

// ==========================================
// GET POS PRODUCTS (FIXED)
// ==========================================
export const getPOSProducts = async (
  restaurantId,
  filters = {}
) => {
  const params = new URLSearchParams({
    restaurant_id: restaurantId,
  });

  if (filters.category_id) {
    params.append("category_id", filters.category_id);
  }

  if (filters.search) {
    params.append("search", filters.search);
  }

  // IMPORTANT: always explicitly send boolean as string
  if (filters.is_veg !== undefined && filters.is_veg !== null) {
    params.append("is_veg", filters.is_veg);
  }

  const response = await axiosInstance.get(
    `/pos/products/?${params.toString()}`
  );

  const data = response.data;

  return {
    products: Array.isArray(data.products) ? data.products : [],
    combos: Array.isArray(data.combos) ? data.combos : [],
    service_charges: Array.isArray(data.service_charges)
      ? data.service_charges
      : [],
  };
};