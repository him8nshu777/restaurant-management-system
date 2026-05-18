import axiosInstance from "../api/axios";

// ==========================================
// UNIT APIs
// ==========================================

// GET UNIT LIST
export const getUnitList = async (restaurantId) => {

    const response = await axiosInstance.get(
        `/inventory/units/?restaurant_id=${restaurantId}`
    );

    return response.data;
};

// CREATE UNIT
export const createUnit = async (data) => {

    const response = await axiosInstance.post(
        "/inventory/units/create/",
        data
    );

    return response.data;
};

// UPDATE UNIT
export const updateUnit = async (
    unitId,
    data
) => {

    const response = await axiosInstance.put(
        `/inventory/units/${unitId}/`,
        data
    );

    return response.data;
};

// TOGGLE UNIT STATUS
export const toggleUnitStatus = async (unitId) => {

    const response = await axiosInstance.patch(
        `/inventory/units/${unitId}/toggle-status/`
    );

    return response.data;
};

// DELETE UNIT
export const deleteUnit = async (unitId) => {

    const response = await axiosInstance.delete(
        `/inventory/units/${unitId}/delete/`
    );

    return response.data;
};



// ==========================================
// INGREDIENT APIs
// ==========================================

// GET INGREDIENT LIST
export const getIngredientList = async (restaurantId) => {

    const response = await axiosInstance.get(
        `/inventory/ingredients/?restaurant_id=${restaurantId}`
    );

    return response.data;
};

// CREATE INGREDIENT
export const createIngredient = async (data) => {

    const response = await axiosInstance.post(
        "/inventory/ingredients/create/",
        data
    );

    return response.data;
};

// UPDATE INGREDIENT
export const updateIngredient = async (
    ingredientId,
    data
) => {

    const response = await axiosInstance.put(
        `/inventory/ingredients/${ingredientId}/`,
        data
    );

    return response.data;
};

// TOGGLE INGREDIENT STATUS
export const toggleIngredientStatus = async (
    ingredientId
) => {

    const response = await axiosInstance.patch(
        `/inventory/ingredients/${ingredientId}/toggle-status/`
    );

    return response.data;
};

// DELETE INGREDIENT
export const deleteIngredient = async (
    ingredientId
) => {

    const response = await axiosInstance.delete(
        `/inventory/ingredients/${ingredientId}/delete/`
    );

    return response.data;
};



// ==========================================
// SUPPLIER APIs
// ==========================================

// GET SUPPLIER LIST
export const getSupplierList = async (restaurantId) => {

    const response = await axiosInstance.get(
        `/inventory/suppliers/?restaurant_id=${restaurantId}`
    );

    return response.data;
};

// CREATE SUPPLIER
export const createSupplier = async (data) => {

    const response = await axiosInstance.post(
        "/inventory/suppliers/create/",
        data
    );

    return response.data;
};

// UPDATE SUPPLIER
export const updateSupplier = async (
    supplierId,
    data
) => {

    const response = await axiosInstance.put(
        `/inventory/suppliers/${supplierId}/`,
        data
    );

    return response.data;
};

// TOGGLE SUPPLIER STATUS
export const toggleSupplierStatus = async (
    supplierId
) => {

    const response = await axiosInstance.patch(
        `/inventory/suppliers/${supplierId}/toggle-status/`
    );

    return response.data;
};

// DELETE SUPPLIER
export const deleteSupplier = async (
    supplierId
) => {

    const response = await axiosInstance.delete(
        `/inventory/suppliers/${supplierId}/delete/`
    );

    return response.data;
};


// ==========================================
// GET INVENTORY TRANSACTIONS
// ==========================================
export const getInventoryTransactionList =
  async (restaurantId) => {

    const response =
      await axiosInstance.get(

        `/inventory/inventory-transactions/?restaurant_id=${restaurantId}`
      );

    return response.data;
};


// ==========================================
// CREATE INVENTORY TRANSACTION
// ==========================================
export const createInventoryTransaction =
  async (data) => {

    const response =
      await axiosInstance.post(

        "/inventory/inventory-transactions/create/",
        data
      );

    return response.data;
};


// ==========================================
// GET PURCHASE LIST
// ==========================================
export const getPurchaseList =
  async (restaurantId) => {

    const response =
      await axiosInstance.get(

        `/inventory/purchases/?restaurant_id=${restaurantId}`
      );

    return response.data;
};


// ==========================================
// CREATE PURCHASE
// ==========================================
export const createPurchase =
  async (data) => {

    const response =
      await axiosInstance.post(

        "/inventory/purchases/create/",
        data
      );

    return response.data;
};


// ==========================================
// UPDATE PURCHASE
// ==========================================
export const updatePurchase =
  async (
    purchaseId,
    data
  ) => {

    const response =
      await axiosInstance.put(

        `/inventory/purchases/${purchaseId}/`,
        data
      );

    return response.data;
};


// ==========================================
// DELETE PURCHASE
// ==========================================
export const deletePurchase =
  async (purchaseId) => {

    const response =
      await axiosInstance.delete(

        `/inventory/purchases/${purchaseId}/delete/`
      );

    return response.data;
};

// ==========================================
// PRODUCT RECIPES
// ==========================================
export const getProductRecipeList =
  async (restaurantId) => {

    const response =
      await axiosInstance.get(

        `/inventory/product-recipes/?restaurant_id=${restaurantId}`
      );

    return response.data;
};


export const createProductRecipe =
  async (data) => {

    const response =
      await axiosInstance.post(

        "/inventory/product-recipes/create/",
        data
      );

    return response.data;
};


export const updateProductRecipe =
  async (
    recipeId,
    data
  ) => {

    const response =
      await axiosInstance.put(

        `/inventory/product-recipes/${recipeId}/`,
        data
      );

    return response.data;
};


export const deleteProductRecipe =
  async (recipeId) => {

    const response =
      await axiosInstance.delete(

        `/inventory/product-recipes/${recipeId}/delete/`
      );

    return response.data;
};


// ==========================================
// COMBO RECIPES
// ==========================================
export const getComboRecipeList =
  async (restaurantId) => {

    const response =
      await axiosInstance.get(

        `/inventory/combo-recipes/?restaurant_id=${restaurantId}`
      );

    return response.data;
};


export const createComboRecipe =
  async (data) => {

    const response =
      await axiosInstance.post(

        "/inventory/combo-recipes/create/",
        data
      );

    return response.data;
};


export const updateComboRecipe =
  async (
    recipeId,
    data
  ) => {

    const response =
      await axiosInstance.put(

        `/inventory/combo-recipes/${recipeId}/`,
        data
      );

    return response.data;
};


export const deleteComboRecipe =
  async (recipeId) => {

    const response =
      await axiosInstance.delete(

        `/inventory/combo-recipes/${recipeId}/delete/`
      );

    return response.data;
};