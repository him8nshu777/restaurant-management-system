// ==========================================
// FILE:
// src/pages/dashboard/inventory/Units.jsx
// ==========================================

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createUnit,
  getUnitList,
  updateUnit,
  deleteUnit,
  toggleUnitStatus,
} from "../../../services/inventoryService";

export default function Units() {
  const [unitList, setUnitList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );
  const user = useSelector((state) => state.auth.user);

  // ==========================================
  // RESTAURANT ID
  // ==========================================
  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  useEffect(() => {
    if (restaurantId) {
      fetchUnitList();
    }
  }, [restaurantId]);

  const fetchUnitList = async () => {
    try {
      const data = await getUnitList(restaurantId);

      setUnitList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch units.",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();

    try {
      await createUnit({
        ...formData,
        restaurant_id: restaurantId,
      });

      fetchUnitList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        code: "",
      });

      setAlert({
        type: "success",
        message: "Unit created successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to create unit.",
      });
    }
  };

  const openEditModal = (unit) => {
    setSelectedUnit(unit);

    setFormData({
      name: unit.name,
      code: unit.code,
    });

    setShowEditModal(true);
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();

    try {
      await updateUnit(selectedUnit.id, formData);

      fetchUnitList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Unit updated successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update unit.",
      });
    }
  };

  const handleToggleStatus = async (unitId) => {
    try {
      await toggleUnitStatus(unitId);

      fetchUnitList();

      setAlert({
        type: "success",
        message: "Unit status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update status.",
      });
    }
  };

  const handleDeleteUnit = async (unitId) => {
    const confirmDelete = window.confirm("Delete this unit?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteUnit(unitId);

      fetchUnitList();

      setAlert({
        type: "success",
        message: "Unit deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete unit.",
      });
    }
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold">Unit Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Unit
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {unitList.map((unit) => (
                  <tr key={unit.id}>
                    <td>{unit.name}</td>

                    <td>{unit.code}</td>

                    <td>
                      <span
                        className={`badge ${unit.is_active ? "bg-success" : "bg-danger"}`}
                      >
                        {unit.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => openEditModal(unit)}
                      >
                        Edit
                      </button>

                      <button
                        className={`btn btn-sm me-2 ${unit.is_active ? "btn-secondary" : "btn-success"}`}
                        onClick={() => handleToggleStatus(unit.id)}
                      >
                        {unit.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUnit(unit.id)}
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
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <ModalWrapper
          title="Create Unit"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUnit}
        >
          <InputField
            label="Unit Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
            placeholder="Kilogram, Dozen"
          />

          <InputField
            label="Unit Code"
            name="code"
            value={formData.code}
            handleChange={handleChange}
            placeholder="Kg, Dz"
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Unit"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateUnit}
        >
          <InputField
            label="Unit Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Unit Code"
            name="code"
            value={formData.code}
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}
    </div>
  );
}

// ==========================================
// REUSABLE MODAL
// ==========================================
function ModalWrapper({ title, children, onClose, onSubmit }) {
  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            <button className="btn-close" onClick={onClose}></button>
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

              <button type="submit" className="btn btn-primary">
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
// REUSABLE INPUT FIELD
// ==========================================
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
