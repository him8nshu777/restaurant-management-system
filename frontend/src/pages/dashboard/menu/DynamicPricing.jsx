// src/pages/menu/DynamicPricing.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getDynamicPricingList,
  createDynamicPricing,
  updateDynamicPricing,
  deleteDynamicPricing,
} from "../../../services/menuService";

// ======================================================
// DYNAMIC PRICING MANAGEMENT
// ======================================================
export default function DynamicPricing() {
  const [pricingList, setPricingList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedPricing, setSelectedPricing] = useState(null);

  const [formData, setFormData] = useState({
    restaurant: "",
    name: "",
    description: "",
    pricing_type: "percentage_discount",
    value: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    days: "",
    priority: 1,
    is_active: true,
  });

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ====================================================
  // FETCH DATA
  // ====================================================
  useEffect(() => {
    if (activeRestaurant?.id) {
      fetchPricingList();
    }
  }, [activeRestaurant]);

  // ====================================================
  // FETCH LIST
  // ====================================================
  const fetchPricingList = async () => {
    try {
      const data = await getDynamicPricingList(activeRestaurant.id);

      setPricingList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch pricing list",
      });
    }
  };

  // ====================================================
  // HANDLE CHANGE
  // ====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ====================================================
  // CREATE
  // ====================================================
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await createDynamicPricing({
        ...formData,
        restaurant: activeRestaurant.id,
      });

      fetchPricingList();

      setShowCreateModal(false);

      setFormData({
        restaurant: "",
        name: "",
        description: "",
        pricing_type: "percentage_discount",
        value: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        days: "",
        priority: 1,
        is_active: true,
      });

      setAlert({
        type: "success",
        message: "Pricing created successfully",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to create pricing",
      });
    }
  };

  // ====================================================
  // OPEN EDIT
  // ====================================================
  const openEditModal = (pricing) => {
    setSelectedPricing(pricing);

    setFormData({
      ...pricing,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE
  // ====================================================
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateDynamicPricing(selectedPricing.id, formData);

      fetchPricingList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Pricing updated successfully",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update pricing",
      });
    }
  };

  // ====================================================
  // DELETE
  // ====================================================
  const handleDelete = async (pricingId) => {
    const confirmDelete = window.confirm("Delete this pricing rule?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDynamicPricing(pricingId);

      fetchPricingList();

      setAlert({
        type: "success",
        message: "Pricing deleted successfully",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete pricing",
      });
    }
  };

  return (
    <div>
      {/* ALERT */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dynamic Pricing</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Pricing
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
                <th>Time</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pricingList.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>

                  <td>{item.pricing_type}</td>

                  <td>{item.value}</td>

                  <td>
                    {item.start_time} -{item.end_time}
                  </td>

                  <td>{item.days}</td>

                  <td>{item.is_active ? "Active" : "Inactive"}</td>

                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
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
        <PricingModal
          title="Create Dynamic Pricing"
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* EDIT */}
      {showEditModal && (
        <PricingModal
          title="Edit Dynamic Pricing"
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}

// ======================================================
// MODAL
// ======================================================
function PricingModal({
  title,
  formData,
  setFormData,
  handleChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            <button className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body row">
              <InputField
                label="Name"
                name="name"
                value={formData.name}
                handleChange={handleChange}
              />

              <InputField
                label="Description"
                name="description"
                value={formData.description}
                handleChange={handleChange}
              />

              <SelectField
                label="Pricing Type"
                name="pricing_type"
                value={formData.pricing_type}
                handleChange={handleChange}
                options={[
                  {
                    value: "percentage_increase",
                    label: "Percentage Increase",
                  },
                  {
                    value: "flat_increase",
                    label: "Flat Increase",
                  },
                  {
                    value: "percentage_discount",
                    label: "Percentage Discount",
                  },
                  {
                    value: "flat_discount",
                    label: "Flat Discount",
                  },
                ]}
              />

              <InputField
                label="Value"
                name="value"
                type="number"
                value={formData.value}
                handleChange={handleChange}
              />

              <InputField
                label="Start Date"
                name="start_date"
                type="date"
                value={formData.start_date}
                handleChange={handleChange}
              />

              <InputField
                label="End Date"
                name="end_date"
                type="date"
                value={formData.end_date}
                handleChange={handleChange}
              />

              <InputField
                label="Start Time"
                name="start_time"
                type="time"
                value={formData.start_time}
                handleChange={handleChange}
              />

              <InputField
                label="End Time"
                name="end_time"
                type="time"
                value={formData.end_time}
                handleChange={handleChange}
              />

              {/* DAYS */}
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">Days</label>

                <div className="d-flex flex-wrap gap-3">
                  {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(
                    (day) => {
                      const selectedDays = formData.days
                        ? formData.days.split(",")
                        : [];

                      return (
                        <div key={day} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={day}
                            checked={selectedDays.includes(day)}
                            onChange={(e) => {
                              let updatedDays = [...selectedDays];

                              if (e.target.checked) {
                                updatedDays.push(day);
                              } else {
                                updatedDays = updatedDays.filter(
                                  (d) => d !== day,
                                );
                              }

                              setFormData({
                                ...formData,
                                days: updatedDays.join(","),
                              });
                            }}
                          />

                          <label
                            className="form-check-label text-uppercase"
                            htmlFor={day}
                          >
                            {day}
                          </label>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <InputField
                label="Priority"
                name="priority"
                type="number"
                value={formData.priority}
                handleChange={handleChange}
              />

              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />

                  <label className="form-check-label">Active</label>
                </div>
              </div>
            </div>

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

// ======================================================
// INPUT FIELD
// ======================================================
function InputField({ label, name, value, handleChange, type = "text" }) {
  return (
    <div className="col-md-6 mb-3">
      <label className="form-label">{label}</label>

      <input
        type={type}
        className="form-control"
        name={name}
        value={value || ""}
        onChange={handleChange}
      />
    </div>
  );
}

// ======================================================
// SELECT FIELD
// ======================================================
function SelectField({ label, name, value, handleChange, options }) {
  return (
    <div className="col-md-6 mb-3">
      <label className="form-label">{label}</label>

      <select
        className="form-select"
        name={name}
        value={value}
        onChange={handleChange}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
