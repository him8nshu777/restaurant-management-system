import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createArea,
  getAreaList,
  updateArea,
  toggleAreaStatus,
  deleteArea,
  getFloorList,
} from "../../services/dashboardService";

// ==========================================
// AREA MANAGEMENT PAGE
// ==========================================
export default function Area() {
  // ==========================================
  // AREA LIST
  // ==========================================
  const [areaList, setAreaList] = useState([]);

  // ==========================================
  // FLOOR LIST
  // ==========================================
  const [floorList, setFloorList] = useState([]);

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
  // SELECTED AREA
  // ==========================================
  const [selectedArea, setSelectedArea] = useState(null);

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    name: "",
    area_type: "indoor",
    floor: "",
  });

  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ==========================================
  // FETCH DATA
  // ==========================================
  useEffect(() => {
    if (activeRestaurant?.id) {
      fetchAreaList();

      fetchFloorList();
    }
  }, [activeRestaurant]);

  // ==========================================
  // FETCH AREAS
  // ==========================================
  const fetchAreaList = async () => {
    try {
      const data = await getAreaList(activeRestaurant.id);

      setAreaList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch areas.",
      });
    }
  };

  // ==========================================
  // FETCH FLOORS
  // ==========================================
  const fetchFloorList = async () => {
    try {
      const data = await getFloorList(activeRestaurant.id);

      setFloorList(data);
    } catch (error) {
      console.log(error);
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
  // CREATE AREA
  // ==========================================
  const handleCreateArea = async (e) => {
    e.preventDefault();

    try {
      await createArea({
        ...formData,

        restaurant_id: activeRestaurant.id,
      });

      fetchAreaList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        area_type: "indoor",
        floor: "",
      });

      setAlert({
        type: "success",
        message: "Area created successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to create area.",
      });
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (area) => {
    setSelectedArea(area);

    setFormData({
      name: area.name,
      area_type: area.area_type,
      floor: area.floor,
    });

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE AREA
  // ==========================================
  const handleUpdateArea = async (e) => {
    e.preventDefault();

    try {
      await updateArea(selectedArea.id, formData);

      fetchAreaList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Area updated successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update area.",
      });
    }
  };

  // ==========================================
  // ACTIVE / INACTIVE AREA
  // ==========================================
  const handleToggleStatus = async (areaId) => {
    try {
      const response = await toggleAreaStatus(areaId);

      fetchAreaList();

      setAlert({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to change area status.",
      });
    }
  };

  // ==========================================
  // DELETE AREA
  // ==========================================
  const handleDeleteArea = async (areaId) => {
    const confirmDelete = window.confirm("Delete this area permanently?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteArea(areaId);

      fetchAreaList();

      setAlert({
        type: "success",
        message: "Area deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete area.",
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
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold">Area Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Area
        </button>
      </div>

      {/* ==========================================
          AREA TABLE
      ========================================== */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {areaList.map((area) => (
                <tr key={area.id}>
                  <td>{area.name}</td>

                  <td className="text-capitalize">{area.area_type}</td>

                  <td>{area.floor_name}</td>

                  <td>
                    <span
                      className={`badge ${
                        area.is_active ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {area.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {/* EDIT */}
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(area)}
                    >
                      Edit
                    </button>

                    {/* ACTIVE/INACTIVE */}
                    <button
                      className={`btn btn-sm me-2 ${
                        area.is_active ? "btn-secondary" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(area.id)}
                    >
                      {area.is_active ? "Deactivate" : "Activate"}
                    </button>

                    {/* DELETE */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteArea(area.id)}
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
          title="Create Area"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateArea}
        >
          <AreaForm
            formData={formData}
            handleChange={handleChange}
            floorList={floorList}
          />
        </ModalWrapper>
      )}

      {/* ==========================================
          EDIT MODAL
      ========================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Area"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateArea}
        >
          <AreaForm
            formData={formData}
            handleChange={handleChange}
            floorList={floorList}
          />
        </ModalWrapper>
      )}
    </div>
  );
}

// ==========================================
// AREA FORM
// ==========================================
function AreaForm({ formData, handleChange, floorList }) {
  return (
    <>
      <InputField
        label="Area Name"
        name="name"
        value={formData.name}
        handleChange={handleChange}
      />

      {/* AREA TYPE */}
      <div className="mb-3">
        <label className="form-label">Area Type</label>

        <select
          className="form-select"
          name="area_type"
          value={formData.area_type}
          onChange={handleChange}
          required
        >
          <option value="indoor">Indoor</option>

          <option value="outdoor">Outdoor</option>

          <option value="vip">VIP</option>

          <option value="smoking">Smoking</option>
        </select>
      </div>

      {/* FLOOR */}
      <div className="mb-3">
        <label className="form-label">Floor</label>

        <select
          className="form-select"
          name="floor"
          value={formData.floor}
          onChange={handleChange}
          required
        >
          <option value="">Select Floor</option>

          {floorList.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

// ==========================================
// MODAL WRAPPER
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
