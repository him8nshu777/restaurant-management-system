// src/pages/menu/Combos.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getComboList,
  createCombo,
  updateCombo,
  deleteCombo,
  toggleComboStatus,
} from "../../../services/menuService";

// ======================================================
// COMBO MANAGEMENT
// ======================================================
export default function Combos() {

  // ====================================================
  // STATES
  // ====================================================
  const [comboList, setComboList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedCombo, setSelectedCombo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    combo_price: "",
  });

  // ====================================================
  // ACTIVE RESTAURANT
  // ====================================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ====================================================
  // FETCH COMBOS
  // ====================================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchComboList();
    }

  }, [activeRestaurant]);

  // ====================================================
  // FETCH COMBO LIST
  // ====================================================
  const fetchComboList = async () => {

    try {

      const data = await getComboList(
        activeRestaurant.id,
      );

      setComboList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to fetch combos",
      });
    }
  };

  // ====================================================
  // HANDLE CHANGE
  // ====================================================
  const handleChange = (e) => {

    const {
      name,
      value,
      files,
      type,
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "file"
          ? files[0]
          : value,
    });
  };

  // ====================================================
  // CREATE COMBO
  // ====================================================
  const handleCreateCombo = async (e) => {

    e.preventDefault();

    try {

      const payload = new FormData();

      payload.append(
        "restaurant",
        activeRestaurant.id,
      );

      payload.append(
        "name",
        formData.name,
      );

      payload.append(
        "description",
        formData.description,
      );

      payload.append(
        "combo_price",
        formData.combo_price,
      );

      if (formData.image) {

        payload.append(
          "image",
          formData.image,
        );
      }

      await createCombo(payload);

      fetchComboList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        description: "",
        image: null,
        combo_price: "",
      });

      setAlert({
        type: "success",
        message: "Combo created successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create combo",
      });
    }
  };

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================
  const openEditModal = (combo) => {

    setSelectedCombo(combo);

    setFormData({
      name: combo.name,
      description: combo.description,
      image: null,
      combo_price: combo.combo_price,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE COMBO
  // ====================================================
  const handleUpdateCombo = async (e) => {

    e.preventDefault();

    try {

      const payload = new FormData();

      payload.append(
        "name",
        formData.name,
      );

      payload.append(
        "description",
        formData.description,
      );

      payload.append(
        "combo_price",
        formData.combo_price,
      );

      if (formData.image) {

        payload.append(
          "image",
          formData.image,
        );
      }

      await updateCombo(
        selectedCombo.id,
        payload,
      );

      fetchComboList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Combo updated successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update combo",
      });
    }
  };

  // ====================================================
  // DELETE COMBO
  // ====================================================
  const handleDeleteCombo = async (comboId) => {

    const confirmDelete = window.confirm(
      "Delete this combo?",
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteCombo(comboId);

      fetchComboList();

      setAlert({
        type: "success",
        message: "Combo deleted successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to delete combo",
      });
    }
  };

  // ====================================================
  // TOGGLE STATUS
  // ====================================================
  const handleToggleStatus = async (
    comboId,
  ) => {

    try {

      await toggleComboStatus(comboId);

      fetchComboList();

      setAlert({
        type: "success",
        message: "Combo status updated",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update status",
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
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          Combo Management
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Create Combo
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {comboList.map((combo) => (

                <tr key={combo.id}>

                  <td>
                    {combo.image ? (
                      <img
                        src={combo.image}
                        alt={combo.name}
                        width="60"
                        height="60"
                        className="rounded"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  <td>{combo.name}</td>

                  <td>
                    ₹{combo.combo_price}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        combo.is_active
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {combo.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        openEditModal(combo)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() =>
                        handleDeleteCombo(
                          combo.id,
                        )
                      }
                    >
                      Delete
                    </button>

                    <button
                      className={`btn btn-sm ${
                        combo.is_active
                          ? "btn-secondary"
                          : "btn-success"
                      }`}
                      onClick={() =>
                        handleToggleStatus(
                          combo.id,
                        )
                      }
                    >
                      {combo.is_active
                        ? "Deactivate"
                        : "Activate"}
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
          title="Create Combo"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateCombo}
        >
          <InputField
            label="Combo Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            handleChange={handleChange}
          />

          <InputField
            label="Combo Price"
            name="combo_price"
            value={formData.combo_price}
            handleChange={handleChange}
            type="number"
          />

          <ImageField
            label="Combo Image"
            name="image"
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Combo"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdateCombo}
        >
          <InputField
            label="Combo Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            handleChange={handleChange}
          />

          <InputField
            label="Combo Price"
            name="combo_price"
            value={formData.combo_price}
            handleChange={handleChange}
            type="number"
          />

          <ImageField
            label="Combo Image"
            name="image"
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}
    </div>
  );
}

// ======================================================
// COMBO PRODUCTS PAGE
// ======================================================
export function ComboProducts() {

  return (
    <div>
      Combo Products Page
    </div>
  );
}

// ======================================================
// MODAL
// ======================================================
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

// ======================================================
// INPUT FIELD
// ======================================================
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

// ======================================================
// TEXTAREA FIELD
// ======================================================
function TextAreaField({
  label,
  name,
  value,
  handleChange,
}) {

  return (
    <div className="mb-3">

      <label className="form-label">
        {label}
      </label>

      <textarea
        className="form-control"
        rows="3"
        name={name}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

// ======================================================
// IMAGE FIELD
// ======================================================
function ImageField({
  label,
  name,
  handleChange,
}) {

  return (
    <div className="mb-3">

      <label className="form-label">
        {label}
      </label>

      <input
        type="file"
        className="form-control"
        name={name}
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}