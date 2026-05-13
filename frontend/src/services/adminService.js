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
export const getStaffList = async () => {

    const response = await axiosInstance.get(
        "/restaurants/staff/"
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