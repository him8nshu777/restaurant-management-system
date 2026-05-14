import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createFloor,
  getFloorList,
  updateFloor,
  deleteFloor,
  toggleFloorStatus,
} from "../../services/dashboardService";

// ==========================================
// FLOOR MANAGEMENT PAGE
// ==========================================
export default function Floor() {
  // ==========================================
  // FLOOR LIST
  // ==========================================
  const [floorList, setFloorList] = useState([]);

  // ==========================================
  // ALERT STATE
  // ==========================================
  const [alert, setAlert] = useState(null);

  // ==========================================
  // CREATE MODAL
  // ==========================================
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ==========================================
  // EDIT MODAL
  // ==========================================
  const [showEditModal, setShowEditModal] = useState(false);

  // ==========================================
  // SELECTED FLOOR
  // ==========================================
  const [selectedFloor, setSelectedFloor] = useState(null);

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    name: "",
    floor_number: "",
  });

  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ==========================================
  // TOGGLE FLOOR STATUS
  // ==========================================
  const handleToggleStatus = async (floorId) => {
    try {
      await toggleFloorStatus(floorId);

      fetchFloorList();

      setAlert({
        type: "success",
        message: "Floor status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update status.",
      });
    }
  };

  // ==========================================
  // FETCH FLOORS
  // ==========================================
  useEffect(() => {
    if (activeRestaurant?.id) {
      fetchFloorList();
    }
  }, [activeRestaurant]);

  // ==========================================
  // GET FLOOR LIST
  // ==========================================
  const fetchFloorList = async () => {
    try {
      const data = await getFloorList(activeRestaurant.id);

      setFloorList(data);
    } catch (error) {
      setAlert({
        type: "danger",

        message: "Failed to fetch floors.",
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
  // CREATE FLOOR
  // ==========================================
  const handleCreateFloor = async (e) => {
    e.preventDefault();

    try {
      await createFloor({
        ...formData,

        restaurant_id: activeRestaurant.id,
      });

      fetchFloorList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        floor_number: "",
      });

      setAlert({
        type: "success",

        message: "Floor created successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);
      setAlert({
        type: "danger",

        message: "Failed to create floor.",
      });
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (floor) => {
    setSelectedFloor(floor);

    setFormData({
      name: floor.name,
      floor_number: floor.floor_number,
    });

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE FLOOR
  // ==========================================
  const handleUpdateFloor = async (e) => {
    e.preventDefault();

    try {
      await updateFloor(
        selectedFloor.id,

        formData,
      );

      fetchFloorList();

      setShowEditModal(false);

      setAlert({
        type: "success",

        message: "Floor updated successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",

        message: "Failed to update floor.",
      });
    }
  };

  // ==========================================
  // DELETE FLOOR
  // ==========================================
  const handleDeleteFloor = async (floorId) => {
    const confirmDelete = window.confirm("Delete this floor?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteFloor(floorId);

      fetchFloorList();

      setAlert({
        type: "success",

        message: "Floor deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",

        message: "Failed to delete floor.",
      });
    }
  };

  return (
    <div>
      {/* ==========================================
                ALERT
            ========================================== */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      {/* ==========================================
                PAGE HEADER
            ========================================== */}
      <div
        className="
                    d-flex
                    justify-content-between
                    mb-4
                "
      >
        <h2 className="fw-bold">Floor Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Floor
        </button>
      </div>

      {/* ==========================================
                FLOOR TABLE
            ========================================== */}
      <div
        className="
                    card
                    border-0
                    shadow-sm
                "
      >
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Floor Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {floorList.map((floor) => (
                <tr key={floor.id}>
                  <td>{floor.name}</td>

                  <td>{floor.floor_number}</td>

                  <td>
                    <span
                      className={`
        badge
        ${floor.is_active ? "bg-success" : "bg-danger"}
      `}
                    >
                      {floor.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {/* EDIT */}
                    <button
                      className="
        btn
        btn-warning
        btn-sm
        me-2
      "
                      onClick={() => openEditModal(floor)}
                    >
                      Edit
                    </button>

                    {/* ACTIVE / INACTIVE */}
                    <button
                      className={`
        btn
        btn-sm
        me-2
        ${floor.is_active ? "btn-secondary" : "btn-success"}
      `}
                      onClick={() => handleToggleStatus(floor.id)}
                    >
                      {floor.is_active ? "Deactivate" : "Activate"}
                    </button>

                    {/* DELETE */}
                    <button
                      className="
        btn
        btn-danger
        btn-sm
      "
                      onClick={() => handleDeleteFloor(floor.id)}
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

      {/* ==========================================
                CREATE MODAL
            ========================================== */}
      {showCreateModal && (
        <ModalWrapper
          title="Create Floor"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFloor}
        >
          <InputField
            label="Floor Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />
          <InputField
            label="Floor Number"
            name="floor_number"
            value={formData.floor_number}
            handleChange={handleChange}
            type="number"
          />
        </ModalWrapper>
      )}

      {/* ==========================================
                EDIT MODAL
            ========================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Floor"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateFloor}
        >
          <InputField
            label="Floor Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />
          <InputField
            label="Floor Number"
            name="floor_number"
            value={formData.floor_number}
            handleChange={handleChange}
            type="number"
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
function InputField({ label, name, value, handleChange, type = "text" }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <input
        type="text"
        className="form-control"
        name={name}
        value={value}
        onChange={handleChange}
        required
      />
    </div>
  );
}
