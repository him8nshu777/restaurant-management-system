// src/services/menuService.js

import axiosInstance from "../api/axios";


// ======================================================
// CATEGORY APIs
// ======================================================


// ======================================================
// GET CATEGORY LIST
// ======================================================
export const getCategoryList = async (
    restaurantId
) => {

    const response =
        await axiosInstance.get(

            `/menu/categories/?restaurant=${restaurantId}`
        );

    return response.data.data;
};


// ======================================================
// CREATE CATEGORY
// ======================================================
export const createCategory = async (
    formData
) => {

    const response =
        await axiosInstance.post(

            "/menu/categories/create/",

            formData,

            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

    return response.data;
};


// ======================================================
// UPDATE CATEGORY
// ======================================================
export const updateCategory = async (
    categoryId,
    formData
) => {

    const response =
        await axiosInstance.put(

            `/menu/categories/${categoryId}/update/`,

            formData,

            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

    return response.data;
};


// ======================================================
// DELETE CATEGORY
// ======================================================
export const deleteCategory = async (
    categoryId
) => {

    const response =
        await axiosInstance.delete(

            `/menu/categories/${categoryId}/delete/`
        );

    return response.data;
};


// ======================================================
// TOGGLE CATEGORY STATUS
// ======================================================
export const toggleCategoryStatus = async (
    categoryId
) => {

    const response =
        await axiosInstance.patch(

            `/menu/categories/${categoryId}/toggle-status/`
        );

    return response.data;
};


// ==========================================
// GET PRODUCT LIST
// ==========================================
export const getProductList = async (
    restaurantId
) => {

    const response = await axiosInstance.get(
        `/menu/products/?restaurant=${restaurantId}`
    );

    return response.data.data;
};


// ==========================================
// CREATE PRODUCT
// ==========================================
export const createProduct = async (
    formData
) => {

    const response = await axiosInstance.post(
        "/menu/products/create/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

// ==========================================
// UPDATE PRODUCT
// ==========================================
export const updateProduct = async (
    productId,
    formData
) => {

    const response = await axiosInstance.put(
        `/menu/products/${productId}/update/`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};


// ==========================================
// DELETE PRODUCT
// ==========================================
export const deleteProduct = async (
    productId
) => {

    const response = await axiosInstance.delete(
        `/menu/products/${productId}/delete/`
    );

    return response.data;
};


// ==========================================
// TOGGLE PRODUCT STATUS
// ==========================================
export const toggleProductStatus = async (
    productId
) => {

    const response = await axiosInstance.patch(
        `/menu/products/${productId}/toggle-status/`
    );

    return response.data;
};