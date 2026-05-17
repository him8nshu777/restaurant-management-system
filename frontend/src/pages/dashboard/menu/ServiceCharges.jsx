// src/pages/menu/ServiceCharges.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getServiceChargeList,
  createServiceCharge,
  updateServiceCharge,
  deleteServiceCharge,
  toggleServiceChargeStatus,
} from "../../../services/menuService";

// ======================================================
// SERVICE CHARGES PAGE
// ======================================================
export default function ServiceCharges() {

  // ====================================================
  // STATES
  // ====================================================
  const [chargeList, setChargeList] =
    useState([]);

  const [alert, setAlert] =
    useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedCharge, setSelectedCharge] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      charge_type: "percentage",
      value: "",
      auto_apply: false,
    });

  // ====================================================
  // ACTIVE RESTAURANT
  // ====================================================
  const activeRestaurant = useSelector(
    (state) =>
      state.restaurant.activeRestaurant,
  );

  // ====================================================
  // FETCH DATA
  // ====================================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchCharges();
    }

  }, [activeRestaurant]);

  // ====================================================
  // FETCH CHARGES
  // ====================================================
  const fetchCharges = async () => {

    try {

      const data =
        await getServiceChargeList(
          activeRestaurant.id,
        );

      setChargeList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to load service charges",
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
      type,
      checked,
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  // ====================================================
  // RESET FORM
  // ====================================================
  const resetForm = () => {

    setFormData({
      name: "",
      description: "",
      charge_type: "percentage",
      value: "",
      auto_apply: false,
    });
  };

  // ====================================================
  // CREATE SERVICE CHARGE
  // ====================================================
  const handleCreate = async (e) => {

    e.preventDefault();

    try {

      await createServiceCharge({
        ...formData,
        restaurant:
          activeRestaurant.id,
      });

      fetchCharges();

      setShowCreateModal(false);

      resetForm();

      setAlert({
        type: "success",
        message:
          "Service charge created successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          error.response?.data?.message ||
          "Failed to create service charge",
      });
    }
  };

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================
  const openEditModal = (charge) => {

    setSelectedCharge(charge);

    setFormData({
      name: charge.name,
      description:
        charge.description || "",
      charge_type:
        charge.charge_type,
      value: charge.value,
      auto_apply:
        charge.auto_apply,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE SERVICE CHARGE
  // ====================================================
  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      await updateServiceCharge(
        selectedCharge.id,
        {
          ...formData,
          restaurant:
            activeRestaurant.id,
        },
      );

      fetchCharges();

      setShowEditModal(false);

      resetForm();

      setAlert({
        type: "success",
        message:
          "Service charge updated successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          error.response?.data?.message ||
          "Failed to update service charge",
      });
    }
  };

  // ====================================================
  // DELETE SERVICE CHARGE
  // ====================================================
  const handleDelete = async (
    chargeId,
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this service charge?",
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteServiceCharge(
        chargeId,
      );

      fetchCharges();

      setAlert({
        type: "success",
        message:
          "Service charge deleted successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to delete service charge",
      });
    }
  };

  // ====================================================
  // TOGGLE STATUS
  // ====================================================
  const handleToggleStatus = async (
    chargeId,
  ) => {

    try {

      await toggleServiceChargeStatus(
        chargeId,
      );

      fetchCharges();

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to update status",
      });
    }
  };

  return (
    <div>

      {/* ALERT */}
      {alert && (
        <div
          className={`alert alert-${alert.type}`}
        >
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
          Service Charges
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Create Service Charge
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Auto Apply</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {chargeList.length > 0 ? (

                chargeList.map((charge) => (

                  <tr key={charge.id}>

                    <td>
                      <div className="fw-semibold">
                        {charge.name}
                      </div>

                      <div className="small text-muted">
                        {
                          charge.description
                        }
                      </div>
                    </td>

                    <td>
                      {charge.charge_type}
                    </td>

                    <td>
                      {charge.charge_type ===
                      "percentage"
                        ? `${charge.value}%`
                        : `₹${charge.value}`}
                    </td>

                    <td>
                      {charge.auto_apply
                        ? "Yes"
                        : "No"}
                    </td>

                    <td>

                      <button
                        className={`btn btn-sm ${
                          charge.is_active
                            ? "btn-success"
                            : "btn-secondary"
                        }`}
                        onClick={() =>
                          handleToggleStatus(
                            charge.id,
                          )
                        }
                      >
                        {charge.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>

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
                          openEditModal(
                            charge,
                          )
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
                          handleDelete(
                            charge.id,
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>
                  </tr>
                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      text-center
                      text-muted
                    "
                  >
                    No service charges found
                  </td>

                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* ==================================================
          CREATE MODAL
      ================================================== */}
      {showCreateModal && (
        <ModalWrapper
          title="Create Service Charge"
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onSubmit={handleCreate}
        >

          <FormFields
            formData={formData}
            handleChange={handleChange}
          />

        </ModalWrapper>
      )}

      {/* ==================================================
          EDIT MODAL
      ================================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Service Charge"
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          onSubmit={handleUpdate}
        >

          <FormFields
            formData={formData}
            handleChange={handleChange}
          />

        </ModalWrapper>
      )}
    </div>
  );
}

// ======================================================
// FORM FIELDS
// ======================================================
function FormFields({
  formData,
  handleChange,
}) {

  return (
    <>
      {/* NAME */}
      <InputField
        label="Name"
        name="name"
        value={formData.name}
        handleChange={handleChange}
      />

      {/* DESCRIPTION */}
      <TextAreaField
        label="Description"
        name="description"
        value={formData.description}
        handleChange={handleChange}
      />

      {/* TYPE */}
      <div className="mb-3">

        <label className="form-label">
          Charge Type
        </label>

        <select
          className="form-select"
          name="charge_type"
          value={formData.charge_type}
          onChange={handleChange}
        >
          <option value="percentage">
            Percentage
          </option>

          <option value="fixed">
            Fixed
          </option>
        </select>
      </div>

      {/* VALUE */}
      <InputField
        label="Value"
        name="value"
        type="number"
        value={formData.value}
        handleChange={handleChange}
      />

      {/* AUTO APPLY */}
      <div className="form-check">

        <input
          type="checkbox"
          className="form-check-input"
          name="auto_apply"
          checked={
            formData.auto_apply
          }
          onChange={handleChange}
        />

        <label className="form-check-label">
          Auto Apply
        </label>
      </div>
    </>
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

          {/* HEADER */}
          <div className="modal-header">

            <h5 className="modal-title">
              {title}
            </h5>

            <button
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* FORM */}
          <form onSubmit={onSubmit}>

            <div className="modal-body">
              {children}
            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="
                  btn
                  btn-secondary
                "
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  btn
                  btn-primary
                "
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
      ></textarea>
    </div>
  );
}