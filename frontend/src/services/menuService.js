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


// ======================================================
// GET VARIANT LIST
// ======================================================
export const getVariantList = async (
  restaurantId,
) => {

  const response =
    await axiosInstance.get(

      `/menu/variants/?restaurant=${restaurantId}`
    );

  return response.data;
};

// ======================================================
// CREATE VARIANT
// ======================================================
export const createVariant = async (
  payload,
) => {

  const response =
    await axiosInstance.post(

      "/menu/variants/create/",
      payload
    );

  return response.data;
};

// ======================================================
// UPDATE VARIANT
// ======================================================
export const updateVariant = async (
  variantId,
  payload,
) => {

  const response =
    await axiosInstance.put(

      `/menu/variants/${variantId}/update/`,
      payload
    );

  return response.data;
};

// ======================================================
// DELETE VARIANT
// ======================================================
export const deleteVariant = async (
  variantId,
) => {

  const response =
    await axiosInstance.delete(

      `/menu/variants/${variantId}/delete/`
    );

  return response.data;
};

// ======================================================
// TOGGLE VARIANT STATUS
// ======================================================
export const toggleVariantStatus = async (
  variantId,
) => {

  const response =
    await axiosInstance.patch(

      `/menu/variants/${variantId}/toggle-status/`
    );

  return response.data;
};

// ======================================================
// ADDON APIs
// ======================================================

// GET ADDON LIST
export const getAddonList = async (restaurantId) => {

  const response = await axiosInstance.get(
    `/menu/addons/?restaurant=${restaurantId}`
  );

  return response.data.data;
};

// CREATE ADDON
export const createAddon = async (payload) => {

  const response = await axiosInstance.post(
    "/menu/addons/create/",
    payload
  );

  return response.data;
};

// UPDATE ADDON
export const updateAddon = async (addonId, payload) => {

  const response = await axiosInstance.put(
    `/menu/addons/${addonId}/update/`,
    payload
  );

  return response.data;
};

// DELETE ADDON
export const deleteAddon = async (addonId) => {

  const response = await axiosInstance.delete(
    `/menu/addons/${addonId}/delete/`
  );

  return response.data;
};

// TOGGLE ADDON STATUS
export const toggleAddonStatus = async (addonId) => {

  const response = await axiosInstance.patch(
    `/menu/addons/${addonId}/toggle-status/`
  );

  return response.data;
};

// ======================================================
// PRODUCT ADDON APIs
// ======================================================

// GET PRODUCT ADDON LIST
// ======================================================
export const getProductAddonList = async (
  restaurantId,
) => {

  const response = await axiosInstance.get(
    `/menu/product-addons/?restaurant=${restaurantId}`,
  );

  return response.data.data;
};

// CREATE PRODUCT ADDON
export const createProductAddon = async (payload) => {

  const response = await axiosInstance.post(
    "/menu/product-addons/create/",
    payload
  );

  return response.data;
};

// DELETE PRODUCT ADDON
export const deleteProductAddon = async (mappingId) => {

  const response = await axiosInstance.delete(
    `/menu/product-addons/${mappingId}/delete/`
  );

  return response.data;
};

// ======================================================
// GET COMBO LIST
// ======================================================
export const getComboList = async (
  restaurantId,
) => {

  const response = await axiosInstance.get(
    `/menu/combos/?restaurant=${restaurantId}`,
  );

  return response.data;
};

// ======================================================
// CREATE COMBO
// ======================================================
export const createCombo = async (
  payload,
) => {

  const response = await axiosInstance.post(
    "/menu/combos/",
    payload,
  );

  return response.data;
};

// ======================================================
// UPDATE COMBO
// ======================================================
export const updateCombo = async (
  comboId,
  payload,
) => {

  const response = await axiosInstance.put(
    `/menu/combos/${comboId}/`,
    payload,
  );

  return response.data;
};

// ======================================================
// DELETE COMBO
// ======================================================
export const deleteCombo = async (
  comboId,
) => {

  const response = await axiosInstance.delete(
    `/menu/combos/${comboId}/`,
  );

  return response.data;
};

// ======================================================
// TOGGLE COMBO STATUS
// ======================================================
export const toggleComboStatus = async (
  comboId,
) => {

  const response = await axiosInstance.patch(
    `/menu/combos/${comboId}/toggle-status/`,
  );

  return response.data;
};

// ======================================================
// GET COMBO PRODUCT LIST
// ======================================================
export const getComboProductList = async (
  restaurantId,
) => {

  const response = await axiosInstance.get(
    `/menu/combo-products/?restaurant=${restaurantId}`,
  );

  return response.data.data;
};

// ======================================================
// CREATE COMBO PRODUCT
// ======================================================
export const createComboProduct = async (
  payload,
) => {

  const response = await axiosInstance.post(
    "/menu/combo-products/",
    payload,
  );

  return response.data;
};

// ======================================================
// UPDATE COMBO PRODUCT
// ======================================================
export const updateComboProduct = async (
  mappingId,
  payload,
) => {

  const response = await axiosInstance.patch(
    `/menu/combo-products/${mappingId}/update/`,
    payload,
  );

  return response.data;
};

// ======================================================
// DELETE COMBO PRODUCT
// ======================================================
export const deleteComboProduct = async (
  mappingId,
) => {

  const response = await axiosInstance.delete(
    `/menu/combo-products/${mappingId}/delete/`,
  );

  return response.data;
};