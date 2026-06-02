import axiosInstance from "../api/axios";

// ==========================================
// SALES REPORT
// ==========================================
export const getSalesReport = async (
  restaurantId,
  period = "week",
  startDate = null,
  endDate = null
) => {

  let url = `/reports/sales/?restaurant_id=${restaurantId}&period=${period}`;

  if (period === "custom" && startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }

  const response = await axiosInstance.get(url);

  return response.data;
};