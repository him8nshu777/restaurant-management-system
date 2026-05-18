import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createComboRecipe,
  deleteComboRecipe,
  getComboRecipeList,
  updateComboRecipe,
} from "../../../services/inventoryService";

import {
  getComboList,
  getVariantList,
} from "../../../services/menuService";

// ==========================================
// COMBO RECIPES
// ==========================================
export default function ComboRecipes() {

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant
  );

  const [recipeList, setRecipeList] =
    useState([]);

  const [comboList, setComboList] =
    useState([]);

  const [variantList, setVariantList] =
    useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedRecipe, setSelectedRecipe] =
    useState(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [formData, setFormData] = useState({
    combo: "",
    product_variant: "",
    quantity: 1,
  });

  // ==========================================
  // FETCH
  // ==========================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchRecipes();

      fetchCombos();

      fetchVariants();
    }

  }, [activeRestaurant]);

  const fetchRecipes = async () => {

    try {

      const data =
        await getComboRecipeList(
          activeRestaurant.id
        );

      setRecipeList(data);

    } catch (error) {

      console.log(error);
    }
  };

  const fetchCombos = async () => {

    try {

      const data =
        await getComboList(
          activeRestaurant.id
        );

      setComboList(data);

    } catch (error) {

      console.log(error);
    }
  };

  const fetchVariants = async () => {

    try {

      const data =
        await getVariantList(
          activeRestaurant.id
        );

      setVariantList(data);

    } catch (error) {

      console.log(error);
    }
  };

  // ==========================================
  // CHANGE
  // ==========================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // CREATE
  // ==========================================
  const handleCreate = async (e) => {

    e.preventDefault();

    try {

      await createComboRecipe({
        ...formData,
        restaurant_id: activeRestaurant.id,
      });

      fetchRecipes();

      setShowCreateModal(false);

      setFormData({
        combo: "",
        product_variant: "",
        quantity: 1,
      });

      setAlert({
        type: "success",
        message: "Combo recipe created.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create combo recipe.",
      });
    }
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================
  const openEditModal = (recipe) => {

    setSelectedRecipe(recipe);

    setFormData({
      product_variant:
        recipe.product_variant,
      quantity: recipe.quantity,
    });

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE
  // ==========================================
  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      await updateComboRecipe(
        selectedRecipe.id,
        formData
      );

      fetchRecipes();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Combo recipe updated.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update combo recipe.",
      });
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete combo recipe?"
      );

    if (!confirmDelete) return;

    try {

      await deleteComboRecipe(id);

      fetchRecipes();

      setAlert({
        type: "success",
        message: "Deleted successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to delete.",
      });
    }
  };

  return (
    <div>

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
          Combo Recipes
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Add Combo Recipe
        </button>

      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table">

            <thead>

              <tr>
                <th>Combo</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {recipeList.map((recipe) => (

                <tr key={recipe.id}>

                  <td>
                    {recipe.combo_name}
                  </td>

                  <td>
                    {recipe.variant_name}
                  </td>

                  <td>
                    {recipe.quantity}
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
                        handleDelete(recipe.id)
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

      {/* CREATE */}
      {showCreateModal && (

        <ModalWrapper
          title="Create Combo Recipe"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreate}
        >

          <SelectField
            label="Combo"
            name="combo"
            value={formData.combo}
            handleChange={handleChange}
            options={comboList}
          />

          <SelectField
            label="Variant"
            name="product_variant"
            value={formData.product_variant}
            handleChange={handleChange}
            options={variantList}
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

      {/* EDIT */}
      {showEditModal && (

        <ModalWrapper
          title="Edit Combo Recipe"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdate}
        >

          <SelectField
            label="Variant"
            name="product_variant"
            value={formData.product_variant}
            handleChange={handleChange}
            options={variantList}
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