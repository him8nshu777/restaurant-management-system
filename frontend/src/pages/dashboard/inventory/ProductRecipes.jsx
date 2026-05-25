import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createProductRecipe,
  deleteProductRecipe,
  getProductRecipeList,
  updateProductRecipe,

  getIngredientList,
} from "../../../services/inventoryService";

import {
  getVariantList,
} from "../../../services/menuService";

// ==========================================
// PRODUCT RECIPES PAGE
// ==========================================
export default function ProductRecipes() {

  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant
  );

    const user = useSelector(
  (state) => state.auth.user
);

// ==========================================
// RESTAURANT ID
// ==========================================
const restaurantId =
  user?.role === "restaurant_admin"
    ? activeRestaurant?.id
    : user?.restaurant_id;

  // ==========================================
  // STATES
  // ==========================================
  const [recipeList, setRecipeList] = useState([]);

  const [ingredientList, setIngredientList] = useState([]);

  const [variantList, setVariantList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedRecipe, setSelectedRecipe] =
    useState(null);

  // ==========================================
  // FORM
  // ==========================================
  const [formData, setFormData] = useState({
    product_variant: "",
    ingredient: "",
    quantity: "",
  });

  // ==========================================
  // FETCH DATA
  // ==========================================
  useEffect(() => {

    if (restaurantId) {

      fetchRecipes();

      fetchIngredients();

      fetchVariants();
    }

  }, [restaurantId]);

  // ==========================================
  // FETCH RECIPES
  // ==========================================
  const fetchRecipes = async () => {

    try {

      const data =
        await getProductRecipeList(
          restaurantId
        );

      setRecipeList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to fetch recipes.",
      });
    }
  };

  // ==========================================
  // FETCH INGREDIENTS
  // ==========================================
  const fetchIngredients = async () => {

    try {

      const data =
        await getIngredientList(
          restaurantId
        );

      setIngredientList(data);

    } catch (error) {

      console.log(error);
    }
  };

  // ==========================================
  // FETCH VARIANTS
  // ==========================================
  const fetchVariants = async () => {

    try {

      const data =
        await getVariantList(
          restaurantId
        );

      setVariantList(data);

    } catch (error) {

      console.log(error);
    }
  };

  // ==========================================
  // HANDLE CHANGE
  // ==========================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // CREATE RECIPE
  // ==========================================
  const handleCreateRecipe = async (e) => {

    e.preventDefault();

    try {

      await createProductRecipe({
        ...formData,
        restaurant_id: restaurantId
      });

      fetchRecipes();

      setShowCreateModal(false);

      setFormData({
        product_variant: "",
        ingredient: "",
        quantity: "",
      });

      setAlert({
        type: "success",
        message: "Recipe created successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create recipe.",
      });
    }
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================
  const openEditModal = (recipe) => {

    setSelectedRecipe(recipe);

    setFormData({
      ingredient: recipe.ingredient,
      quantity: recipe.quantity,
    });

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE
  // ==========================================
  const handleUpdateRecipe = async (e) => {

    e.preventDefault();

    try {

      await updateProductRecipe(
        selectedRecipe.id,
        formData
      );

      fetchRecipes();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Recipe updated successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update recipe.",
      });
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const handleDeleteRecipe = async (recipeId) => {

    const confirmDelete =
      window.confirm("Delete recipe?");

    if (!confirmDelete) return;

    try {

      await deleteProductRecipe(recipeId);

      fetchRecipes();

      setAlert({
        type: "success",
        message: "Recipe deleted successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to delete recipe.",
      });
    }
  };

  return (
    <div>

      {/* ALERT */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* HEADER */}
      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >
        <h2 className="fw-bold">
          Product Recipes
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Add Recipe
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table">

            <thead>
              <tr>
                <th>Variant</th>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {recipeList.map((recipe) => (

                <tr key={recipe.id}>

                  <td>
                    {recipe.variant_name}
                  </td>

                  <td>
                    {recipe.ingredient_name}
                  </td>

                  <td>
                    {recipe.quantity}
                    {" "}
                    {recipe.unit_code}
                  </td>

                  <td>

                    <button
                      className="
                        btn
                        btn-warning
                        btn-sm
                        me-2
                      "
                      onClick={() =>
                        openEditModal(recipe)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="
                        btn
                        btn-danger
                        btn-sm
                      "
                      onClick={() =>
                        handleDeleteRecipe(recipe.id)
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (

        <ModalWrapper
          title="Create Recipe"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateRecipe}
        >

          <SelectField
            label="Product Variant"
            name="product_variant"
            value={formData.product_variant}
            handleChange={handleChange}
            options={variantList}
          />

          <SelectField
            label="Ingredient"
            name="ingredient"
            value={formData.ingredient}
            handleChange={handleChange}
            options={ingredientList}
          />

          <InputField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            handleChange={handleChange}
            type="number"
          />

        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (

        <ModalWrapper
          title="Edit Recipe"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdateRecipe}
        >

          <SelectField
            label="Ingredient"
            name="ingredient"
            value={formData.ingredient}
            handleChange={handleChange}
            options={ingredientList}
          />

          <InputField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            handleChange={handleChange}
            type="number"
          />

        </ModalWrapper>
      )}

    </div>
  );
}

// ==========================================
// MODAL
// ==========================================
function ModalWrapper({
  title,
  children,
  onClose,
  onSubmit,
}) {

  return (
    <div className="modal d-block">

      <div className="modal-dialog">

        <div className="modal-content">

          <div className="modal-header">

            <h5 className="modal-title">
              {title}
            </h5>

            <button
              className="btn-close"
              onClick={onClose}
            ></button>

          </div>

          <form onSubmit={onSubmit}>

            <div className="modal-body">
              {children}
            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Save
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// INPUT FIELD
// ==========================================
function InputField({
  label,
  name,
  value,
  handleChange,
  type = "text",
}) {

  return (
    <div className="mb-3">

      <label className="form-label">
        {label}
      </label>

      <input
        type={type}
        className="form-control"
        name={name}
        value={value}
        onChange={handleChange}
        required
      />

    </div>
  );
}

// ==========================================
// SELECT FIELD
// ==========================================
function SelectField({
  label,
  name,
  value,
  handleChange,
  options,
}) {

  return (
    <div className="mb-3">

      <label className="form-label">
        {label}
      </label>

      <select
        className="form-select"
        name={name}
        value={value}
        onChange={handleChange}
        required
      >

        <option value="">
          Select {label}
        </option>

        {options.map((item) => (

          <option
            key={item.id}
            value={item.id}
          >
            {item.product_name} - {item.name}
          </option>

        ))}

      </select>

    </div>
  );
}