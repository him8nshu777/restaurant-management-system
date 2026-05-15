import axiosInstance from "../api/axios";


// ==========================================
// GET FLOOR LIST
// ==========================================
export const getFloorList = async (
    restaurantId
) => {

    const response =
        await axiosInstance.get(

            `/restaurants/floors/?restaurant_id=${restaurantId}`
        );

    return response.data;
};


// ==========================================
// CREATE FLOOR
// ==========================================
export const createFloor = async (
    data
) => {

    const response =
        await axiosInstance.post(

            "/restaurants/floors/create/",
            data
        );

    return response.data;
};


// ==========================================
// UPDATE FLOOR
// ==========================================
export const updateFloor = async (
    floorId,
    data
) => {

    const response =
        await axiosInstance.put(

            `/restaurants/floors/${floorId}/`,
            data
        );

    return response.data;
};


// ==========================================
// TOGGLE FLOOR STATUS
// ==========================================
export const toggleFloorStatus =
  async (floorId) => {

    const response =
      await axiosInstance.patch(

        `/restaurants/floors/${floorId}/toggle-status/`
      );

    return response.data;
};


// ==========================================
// DELETE FLOOR
// ==========================================
export const deleteFloor =
  async (floorId) => {

    const response =
      await axiosInstance.delete(

        `/restaurants/floors/${floorId}/delete/`
      );

    return response.data;
};


// ==========================================
// GET AREA LIST
// ==========================================
export const getAreaList = async (
    restaurantId
) => {

    const response =
        await axiosInstance.get(

            `/restaurants/areas/?restaurant_id=${restaurantId}`
        );

    return response.data;
};


// ==========================================
// CREATE AREA
// ==========================================
export const createArea = async (
    data
) => {

    const response =
        await axiosInstance.post(

            "/restaurants/areas/create/",
            data
        );

    return response.data;
};


// ==========================================
// UPDATE AREA
// ==========================================
export const updateArea = async (
    areaId,
    data
) => {

    const response =
        await axiosInstance.put(

            `/restaurants/areas/${areaId}/`,
            data
        );

    return response.data;
};


// ==========================================
// ACTIVE / INACTIVE AREA
// ==========================================
export const toggleAreaStatus = async (
    areaId
) => {

    const response =
        await axiosInstance.patch(

            `/restaurants/areas/${areaId}/toggle-status/`
        );

    return response.data;
};


// ==========================================
// DELETE AREA
// ==========================================
export const deleteArea = async (
    areaId
) => {

    const response =
        await axiosInstance.delete(

            `/restaurants/areas/${areaId}/delete/`
        );

    return response.data;
};

// ==========================================
// GET TABLE LIST
// ==========================================
export const getTableList = async (
    restaurantId
) => {

    const response =
        await axiosInstance.get(

            `/restaurants/tables/?restaurant_id=${restaurantId}`
        );

    return response.data;
};


// ==========================================
// CREATE TABLE
// ==========================================
export const createTable = async (
    data
) => {

    const response =
        await axiosInstance.post(

            "/restaurants/tables/create/",
            data
        );

    return response.data;
};


// ==========================================
// UPDATE TABLE
// ==========================================
export const updateTable = async (
    tableId,
    data
) => {

    const response =
        await axiosInstance.put(

            `/restaurants/tables/${tableId}/`,
            data
        );

    return response.data;
};


// ==========================================
// DELETE / ACTIVE-INACTIVE TABLE
// ==========================================
export const deleteTable = async (
    tableId
) => {

    const response =
        await axiosInstance.delete(

            `/restaurants/tables/${tableId}/`
        );

    return response.data;
};

// ==========================================
// TOGGLE TABLE STATUS
// ==========================================
export const toggleTableStatus = async (
    tableId
) => {

    const response =
        await axiosInstance.patch(

            `/restaurants/tables/${tableId}/toggle-status/`
        );

    return response.data;
};