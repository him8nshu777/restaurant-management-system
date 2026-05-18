import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createIngredient,
  getIngredientList,
  updateIngredient,
  deleteIngredient,
  toggleIngredientStatus,
  getUnitList,
} from "../../../services/inventoryService";

export default function Ingredients() {
  const [ingredientList, setIngredientList] = useState([]);

  const [unitList, setUnitList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    current_stock: "",
    low_stock_threshold: "",
    cost_per_unit: "",
  });

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  useEffect(() => {
    if (activeRestaurant?.id) {
      fetchIngredientList();
      fetchUnitList();
    }
  }, [activeRestaurant]);

  const fetchIngredientList = async () => {
    try {
      const data = await getIngredientList(activeRestaurant.id);

      setIngredientList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch ingredients.",
      });
    }
  };

  const fetchUnitList = async () => {
    try {
      const data = await getUnitList(activeRestaurant.id);

      setUnitList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleCreateIngredient = async (e) => {
    e.preventDefault();

    try {
      await createIngredient({
        ...formData,

        restaurant_id: activeRestaurant.id,
      });

      fetchIngredientList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        unit: "",
        current_stock: "",
        low_stock_threshold: "",
        cost_per_unit: "",
      });

      setAlert({
        type: "success",
        message: "Ingredient created successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to create ingredient.",
      });
    }
  };

  const openEditModal = (ingredient) => {
    setSelectedIngredient(ingredient);

    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      current_stock: ingredient.current_stock,
      low_stock_threshold: ingredient.low_stock_threshold,
      cost_per_unit: ingredient.cost_per_unit,
    });

    setShowEditModal(true);
  };

  const handleUpdateIngredient = async (e) => {
    e.preventDefault();

    try {
      await updateIngredient(
        selectedIngredient.id,
        formData,
      );

      fetchIngredientList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Ingredient updated successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update ingredient.",
      });
    }
  };

  const handleToggleStatus = async (ingredientId) => {
    try {
      await toggleIngredientStatus(ingredientId);

      fetchIngredientList();

      setAlert({
        type: "success",
        message: "Ingredient status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update status.",
      });
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    const confirmDelete = window.confirm(
      "Delete this ingredient?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteIngredient(ingredientId);

      fetchIngredientList();

      setAlert({
        type: "success",
        message: "Ingredient deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete ingredient.",
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

      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold">Ingredient Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Ingredient
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Low Alert</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {ingredientList.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>{ingredient.name}</td>

                  <td>{ingredient.unit_code}</td>

                  <td>{ingredient.current_stock}</td>

                  <td>{ingredient.low_stock_threshold}</td>

                  <td>{ingredient.cost_per_unit}</td>

                  <td>
                    <span
                      className={`badge ${ingredient.is_active ? "bg-success" : "bg-danger"}`}
                    >
                      {ingredient.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        openEditModal(ingredient)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={`btn btn-sm me-2 ${
                        ingredient.is_active
                          ? "btn-secondary"
                          : "btn-success"
                      }`}
                      onClick={() =>
                        handleToggleStatus(ingredient.id)
                      }
                    >
                      {ingredient.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDeleteIngredient(ingredient.id)
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
          title="Create Ingredient"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateIngredient}
        >
          <InputField
            label="Ingredient Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
            placeholder="Maida, Oil"
          />

          <SelectField
            label="Unit"
            name="unit"
            value={formData.unit}
            handleChange={handleChange}
            options={unitList}
          />

          <InputField
            label="Current Stock"
            name="current_stock"
            value={formData.current_stock}
            handleChange={handleChange}
            type="number"
            placeholder="Kilogram, Dozen"
          />

          <InputField
            label="Low Stock Threshold"
            name="low_stock_threshold"
            value={formData.low_stock_threshold}
            handleChange={handleChange}
            type="number"
          />

          <InputField
            label="Cost Per Unit"
            name="cost_per_unit"
            value={formData.cost_per_unit}
            handleChange={handleChange}
            type="number"
          />
        </ModalWrapper>
      )}

      {/* EDIT */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Ingredient"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateIngredient}
        >
          <InputField
            label="Ingredient Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <SelectField
            label="Unit"
            name="unit"
            value={formData.unit}
            handleChange={handleChange}
            options={unitList}
          />

          <InputField
            label="Current Stock"
            name="current_stock"
            value={formData.current_stock}
            handleChange={handleChange}
            type="number"
          />

          <InputField
            label="Low Stock Threshold"
            name="low_stock_threshold"
            value={formData.low_stock_threshold}
            handleChange={handleChange}
            type="number"
          />

          <InputField
            label="Cost Per Unit"
            name="cost_per_unit"
            value={formData.cost_per_unit}
            handleChange={handleChange}
            type="number"
          />
        </ModalWrapper>
      )}
    </div>
  );
}

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
            <h5 className="modal-title">{title}</h5>

            <button
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body">{children}</div>

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

function InputField({
  label,
  name,
  value,
  handleChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <input
        type={type}
        className="form-control"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  handleChange,
  options,
}) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <select
        className="form-select"
        name={name}
        value={value}
        onChange={handleChange}
        required
      >
        <option value="">Select Unit</option>

        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name} ({option.code})
          </option>
        ))}
      </select>
    </div>
  );
}