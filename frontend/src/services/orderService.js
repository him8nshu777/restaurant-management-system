import axiosInstance from "../api/axios";

// ==========================================
// CREATE ORDER
// ==========================================
export const createOrder = async (
  restaurantId,
  payload
) => {

  const response =
    await axiosInstance.post(
      `/order/${restaurantId}/create/`,
      payload
    );

  return response.data;

};

// ==========================================
// ORDER LIST
// ==========================================
export const getOrderList = async ({
  restaurantId,
  kitchen = false,
}) => {

  const response = await axiosInstance.get(
    `/order/${restaurantId}/list/`,
    {
      params: {
        kitchen,
      },
    }
  );

  return response.data;
};

// ==========================================
// ORDER DETAIL
// ==========================================
export const getOrderDetail = async (
  orderId
) => {

  const response =
    await axiosInstance.get(
      `/order/${orderId}/detail/`
    );

  return response.data;

};

// ==========================================
// UPDATE ORDER
// ==========================================
export const updateOrder = async (
  orderId,
  payload
) => {

  const response =
    await axiosInstance.patch(
      `/order/${orderId}/update/`,
      payload
    );

  return response.data;

};

// ==========================================
// DELETE ORDER
// ==========================================
export const deleteOrder = async (
  orderId
) => {

  const response =
    await axiosInstance.delete(
      `/order/${orderId}/delete/`
    );

  return response.data;

};

// ==========================================
// UPDATE ORDER STATUS
// ==========================================
export const updateOrderStatus = async (
  orderId,
  payload
) => {

  const response =
    await axiosInstance.patch(
      `/order/${orderId}/status/`,
      payload
    );

  return response.data;

};

// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================
export const updatePaymentStatus =
  async (
    orderId,
    payload
  ) => {

    const response =
      await axiosInstance.patch(
        `/order/${orderId}/payment-status/`,
        payload
      );

    return response.data;

  };

// ==========================================
// TAKE PAYMENT
// ==========================================
export const takePayment = async (
  orderId,
  payload
) => {

  const response =
    await axiosInstance.post(
      `/order/${orderId}/payment/`,
      payload
    );

  return response.data;

};

// ==========================================
// COMPLETE ORDER
// ==========================================
export const completeOrder = async (
  orderId
) => {

  const response =
    await axiosInstance.patch(
      `/order/${orderId}/complete/`
    );

  return response.data;

};

// ==========================================
// CANCEL ORDER
// ==========================================
export const cancelOrder = async (
  orderId
) => {

  const response =
    await axiosInstance.patch(
      `/order/${orderId}/cancel/`
    );

  return response.data;

};

// ==========================================
// ASSIGN DELIVERY ORDER
// ==========================================
export const assignDeliveryOrder = async (
  orderId
) => {

  const response =
    await axiosInstance.patch(
      `/order/${orderId}/accept-delivery/`
    );

  return response.data;

};

// ==========================================
// UPDATE DELIVERY STATUS
// ==========================================
export const updateDeliveryStatus = async (
  orderId,
  payload
) => {

  const response =
    await axiosInstance.patch(
      `/order/${orderId}/delivery-status/`,
      payload
    );

  return response.data;
};