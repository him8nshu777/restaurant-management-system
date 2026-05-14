// ==========================================
// ADMIN SERVICES
// ==========================================
// Handles:
// - Staff creation
// - Staff listing
// - Staff update
// - Staff delete
// ==========================================

import axiosInstance from "../api/axios";

// ==========================================
// GET OWNER RESTAURANTS
// ==========================================
export const getRestaurants = async () => {

    const response =
        await axiosInstance.get(
            "/restaurants/my-restaurants/"
        );

    return response.data;
};

// ==========================================
// UPDATE RESTAURANT
// ==========================================
export const updateRestaurant = async (
    restaurantId,
    data
) => {

    const response =
        await axiosInstance.patch(
            `/restaurants/my-restaurants/${restaurantId}/`,
            data
        );

    return response.data;
};

// ==========================================
// CREATE RESTAURANT
// ==========================================
export const createRestaurant = async (data) => {

    const response =
        await axiosInstance.post(
            "/restaurants/my-restaurants/create/",
            data
        );

    return response.data;
};

// ==========================================
// DELETE RESTAURANT
// ==========================================
export const deleteRestaurant = async (
    restaurantId
) => {

    const response =
        await axiosInstance.delete(
            `/restaurants/my-restaurants/${restaurantId}/`
        );

    return response.data;
};

// ==========================================
// CREATE STAFF MEMBER
// ==========================================
export const createStaff = async (data) => {

    const response = await axiosInstance.post(
        "/restaurants/staff/create/",
        data
    );

    return response.data;
};


// ==========================================
// GET STAFF LIST
// ==========================================
export const getStaffList = async (restaurantId) => {

    const response = await axiosInstance.get(
        `/restaurants/staff/?restaurant_id=${restaurantId}`
    );

    return response.data;
};


// ==========================================
// DEACTIVATE STAFF MEMBER
// ==========================================
export const deleteStaff = async (staffId) => {

    const response = await axiosInstance.delete(
        `/restaurants/staff/${staffId}/`
    );

    return response.data;
};

// ==========================================
// UPDATE STAFF MEMBER
// ==========================================
export const updateStaff = async (
    staffId,
    data
) => {

    const response = await axiosInstance.put(
        `/restaurants/staff/${staffId}/`,
        data
    );

    return response.data;
};