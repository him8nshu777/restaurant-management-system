import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getAddonList,
  createAddon,
  updateAddon,
  deleteAddon,
  toggleAddonStatus,
} from "../../../services/menuService";


// ======================================================
// ADDON MANAGEMENT
// ======================================================
export default function Addons() {

  // ====================================================
  // STATES
  // ====================================================
  const [addonList, setAddonList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedAddon, setSelectedAddon] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });

  // ====================================================
  // ACTIVE RESTAURANT
  // ====================================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant
  );

  // ====================================================
  // FETCH ADDONS
  // ====================================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchAddonList();
    }

  }, [activeRestaurant]);

  // ====================================================
  // GET ADDON LIST
  // ====================================================
  const fetchAddonList = async () => {

    try {

      const data = await getAddonList(
        activeRestaurant.id
      );

      setAddonList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to fetch addons",
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
  // CREATE ADDON
  // ====================================================
  const handleCreateAddon = async (e) => {

    e.preventDefault();

    try {

      await createAddon({
        restaurant: activeRestaurant.id,
        name: formData.name,
        price: formData.price,
      });

      fetchAddonList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        price: "",
      });

      setAlert({
        type: "success",
        message: "Addon created successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create addon",
      });
    }
  };

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================
  const openEditModal = (addon) => {

    setSelectedAddon(addon);

    setFormData({
      name: addon.name,
      price: addon.price,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE ADDON
  // ====================================================
  const handleUpdateAddon = async (e) => {

    e.preventDefault();

    try {

      await updateAddon(
        selectedAddon.id,
        formData
      );

      fetchAddonList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Addon updated successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update addon",
      });
    }
  };

  // ====================================================
  // DELETE ADDON
  // ====================================================
  const handleDeleteAddon = async (addonId) => {

    const confirmDelete = window.confirm(
      "Delete this addon?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteAddon(addonId);

      fetchAddonList();

      setAlert({
        type: "success",
        message: "Addon deleted successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to delete addon",
      });
    }
  };

  // ====================================================
  // TOGGLE STATUS
  // ====================================================
  const handleToggleStatus = async (addonId) => {

    try {

      await toggleAddonStatus(addonId);

      fetchAddonList();

      setAlert({
        type: "success",
        message: "Addon status updated",
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
          Addon Management
        </h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Addon
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {addonList.map((addon) => (

                <tr key={addon.id}>

                  <td>{addon.name}</td>

                  <td>₹{addon.price}</td>

                  <td>
                    <span
                      className={`badge ${
                        addon.is_active
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {addon.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      addon.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(addon)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDeleteAddon(addon.id)}
                    >
                      Delete
                    </button>

                    <button
                      className={`btn btn-sm ${
                        addon.is_active
                          ? "btn-secondary"
                          : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(addon.id)}
                    >
                      {addon.is_active
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
          title="Create Addon"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAddon}
        >
          <InputField
            label="Addon Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
            placeholder="Extra Cheese, Extra Sauce, Coke etc"
          />

          <InputField
            label="Price"
            name="price"
            value={formData.price}
            handleChange={handleChange}
            type="number"
            placeholder="5"
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Addon"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateAddon}
        >
          <InputField
            label="Addon Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Price"
            name="price"
            value={formData.price}
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
  placeholder = "",
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
        placeholder={placeholder}
        required
      />
    </div>
  );
}