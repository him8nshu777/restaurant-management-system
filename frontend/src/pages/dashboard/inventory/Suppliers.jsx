// ==========================================
// FILE:
// src/pages/dashboard/inventory/Suppliers.jsx
// ==========================================

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createSupplier,
  getSupplierList,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} from "../../../services/inventoryService";

// ==========================================
// SUPPLIER MANAGEMENT PAGE
// ==========================================
export default function Suppliers() {
  // ==========================================
  // SUPPLIER LIST
  // ==========================================
  const [supplierList, setSupplierList] = useState([]);

  // ==========================================
  // ALERT
  // ==========================================
  const [alert, setAlert] = useState(null);

  // ==========================================
  // MODALS
  // ==========================================
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  // ==========================================
  // SELECTED SUPPLIER
  // ==========================================
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ==========================================
  // FORM DATA
  // ==========================================
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
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

  // ==========================================
  // FETCH SUPPLIERS
  // ==========================================
  useEffect(() => {
    if (restaurantId) {
      fetchSupplierList();
    }
  }, [restaurantId]);

  // ==========================================
  // GET SUPPLIER LIST
  // ==========================================
  const fetchSupplierList = async () => {
    try {
      const data = await getSupplierList(restaurantId);

      setSupplierList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch suppliers.",
      });
    }
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // CREATE SUPPLIER
  // ==========================================
  const handleCreateSupplier = async (e) => {
    e.preventDefault();

    try {
      await createSupplier({
        ...formData,

        restaurant_id: restaurantId,
      });

      fetchSupplierList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      setAlert({
        type: "success",
        message: "Supplier created successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to create supplier.",
      });
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);

    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE SUPPLIER
  // ==========================================
  const handleUpdateSupplier = async (e) => {
    e.preventDefault();

    try {
      await updateSupplier(selectedSupplier.id, formData);

      fetchSupplierList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Supplier updated successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update supplier.",
      });
    }
  };

  // ==========================================
  // TOGGLE STATUS
  // ==========================================
  const handleToggleStatus = async (supplierId) => {
    try {
      await toggleSupplierStatus(supplierId);

      fetchSupplierList();

      setAlert({
        type: "success",
        message: "Supplier status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update status.",
      });
    }
  };

  // ==========================================
  // DELETE SUPPLIER
  // ==========================================
  const handleDeleteSupplier = async (supplierId) => {
    const confirmDelete = window.confirm("Delete this supplier?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteSupplier(supplierId);

      fetchSupplierList();

      setAlert({
        type: "success",
        message: "Supplier deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete supplier.",
      });
    }
  };

  return (
    <div>
      {/* ALERT */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold">Supplier Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Supplier
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>

                  <th>Phone</th>

                  <th>Email</th>

                  <th>Address</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {supplierList.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>

                    <td>{supplier.phone}</td>

                    <td>{supplier.email || "-"}</td>

                    <td>{supplier.address || "-"}</td>

                    <td>
                      <span
                        className={`badge ${
                          supplier.is_active ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {supplier.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                      {/* EDIT */}
                      <button
                        className="
                        btn
                        btn-warning
                        btn-sm
                        me-2
                      "
                        onClick={() => openEditModal(supplier)}
                      >
                        Edit
                      </button>

                      {/* STATUS */}
                      <button
                        className={`
                        btn
                        btn-sm
                        me-2
                        ${supplier.is_active ? "btn-secondary" : "btn-success"}
                      `}
                        onClick={() => handleToggleStatus(supplier.id)}
                      >
                        {supplier.is_active ? "Deactivate" : "Activate"}
                      </button>

                      {/* DELETE */}
                      <button
                        className="
                        btn
                        btn-danger
                        btn-sm
                      "
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        Delete
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==========================================
            CREATE MODAL
        ========================================== */}
      {showCreateModal && (
        <ModalWrapper
          title="Create Supplier"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSupplier}
        >
          <InputField
            label="Supplier Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            handleChange={handleChange}
          />

          <InputField
            label="Email"
            name="email"
            value={formData.email}
            handleChange={handleChange}
            type="email"
          />

          <TextAreaField
            label="Address"
            name="address"
            value={formData.address}
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}

      {/* ==========================================
            EDIT MODAL
        ========================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Supplier"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateSupplier}
        >
          <InputField
            label="Supplier Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            handleChange={handleChange}
          />

          <InputField
            label="Email"
            name="email"
            value={formData.email}
            handleChange={handleChange}
            type="email"
          />

          <TextAreaField
            label="Address"
            name="address"
            value={formData.address}
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
// INPUT FIELD
// ==========================================
function InputField({ label, name, value, handleChange, type = "text" }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

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
// TEXTAREA FIELD
// ==========================================
function TextAreaField({ label, name, value, handleChange }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

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
