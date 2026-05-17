// src/pages/menu/Taxes.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getTaxList,
  createTax,
  updateTax,
  deleteTax,
  toggleTaxStatus,
} from "../../../services/menuService";

// ======================================================
// TAX MANAGEMENT
// ======================================================
export default function Taxes() {

  // ====================================================
  // STATES
  // ====================================================
  const [taxList, setTaxList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedTax, setSelectedTax] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    percentage: "",
  });

  // ====================================================
  // ACTIVE RESTAURANT
  // ====================================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ====================================================
  // FETCH TAXES
  // ====================================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchTaxes();
    }

  }, [activeRestaurant]);

  // ====================================================
  // GET TAX LIST
  // ====================================================
  const fetchTaxes = async () => {

    try {

      const data = await getTaxList(
        activeRestaurant.id,
      );

      setTaxList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to fetch taxes",
      });
    }
  };

  // ====================================================
  // HANDLE CHANGE
  // ====================================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ====================================================
  // CREATE TAX
  // ====================================================
  const handleCreateTax = async (e) => {

    e.preventDefault();

    try {

      await createTax({
        restaurant: activeRestaurant.id,
        name: formData.name,
        percentage: formData.percentage,
      });

      fetchTaxes();

      setShowCreateModal(false);

      setFormData({
        name: "",
        percentage: "",
      });

      setAlert({
        type: "success",
        message: "Tax created successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create tax",
      });
    }
  };

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================
  const openEditModal = (tax) => {

    setSelectedTax(tax);

    setFormData({
      name: tax.name,
      percentage: tax.percentage,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE TAX
  // ====================================================
  const handleUpdateTax = async (e) => {

    e.preventDefault();

    try {

      await updateTax(
        selectedTax.id,
        formData,
      );

      fetchTaxes();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Tax updated successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update tax",
      });
    }
  };

  // ====================================================
  // DELETE TAX
  // ====================================================
  const handleDeleteTax = async (taxId) => {

    const confirmDelete = window.confirm(
      "Delete this tax?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteTax(taxId);

      fetchTaxes();

      setAlert({
        type: "success",
        message: "Tax deleted successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to delete tax",
      });
    }
  };

  // ====================================================
  // TOGGLE STATUS
  // ====================================================
  const handleToggleStatus = async (taxId) => {

    try {

      await toggleTaxStatus(taxId);

      fetchTaxes();

      setAlert({
        type: "success",
        message: "Tax status updated",
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
          Tax Management
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Create Tax
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Name</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {taxList.map((tax) => (

                <tr key={tax.id}>

                  <td>{tax.name}</td>

                  <td>
                    {tax.percentage}%
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        tax.is_active
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {tax.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        openEditModal(tax)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() =>
                        handleDeleteTax(tax.id)
                      }
                    >
                      Delete
                    </button>

                    <button
                      className={`btn btn-sm ${
                        tax.is_active
                          ? "btn-secondary"
                          : "btn-success"
                      }`}
                      onClick={() =>
                        handleToggleStatus(
                          tax.id,
                        )
                      }
                    >
                      {tax.is_active
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
          title="Create Tax"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateTax}
        >
          <InputField
            label="Tax Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Percentage"
            name="percentage"
            value={formData.percentage}
            handleChange={handleChange}
            type="number"
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Tax"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdateTax}
        >
          <InputField
            label="Tax Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Percentage"
            name="percentage"
            value={formData.percentage}
            handleChange={handleChange}
            type="number"
          />
        </ModalWrapper>
      )}
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