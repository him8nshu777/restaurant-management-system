import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createTable,
  getTableList,
  updateTable,
  deleteTable,
  getFloorList,
  getAreaList,
  toggleTableStatus,
} from "../../services/dashboardService";

// ==========================================
// TABLE MANAGEMENT PAGE
// ==========================================
export default function Table() {
  // ==========================================
  // TABLE LIST
  // ==========================================
  const [tableList, setTableList] = useState([]);

  // ==========================================
  // FLOOR LIST
  // ==========================================
  const [floorList, setFloorList] = useState([]);

  // ==========================================
  // AREA LIST
  // ==========================================
  const [areaList, setAreaList] = useState([]);

  // ==========================================
  // ALERT
  // ==========================================
  const [alert, setAlert] = useState(null);

  //waiter assignment
  const [waiterList, setWaiterList] = useState([]);

  // ==========================================
  // MODALS
  // ==========================================
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: "",
    floor: "",
    area: "",
    status: "available",
    assigned_waiter: "",
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
      fetchTableList();

      fetchAreaList();
      fetchFloorList();
    }
  }, [activeRestaurant]);

  // ==========================================
  // FETCH TABLES
  // ==========================================
  const fetchTableList = async () => {
    try {
      const data = await getTableList(activeRestaurant.id);

      setTableList(data.tables || []);
      setWaiterList(data.waiters || []);
    } catch (error) {
      setTableList([]); // fallback safety
      setWaiterList([]);
      setAlert({
        type: "danger",
        message: "Failed to fetch tables.",
      });
    }
  };

  // ==========================================
  // FETCH Floors
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
  // FETCH AREAS
  // ==========================================
  const fetchAreaList = async () => {
    try {
      const data = await getAreaList(activeRestaurant.id);

      setAreaList(data);
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
  // CREATE TABLE
  // ==========================================
  const handleCreateTable = async (e) => {
    e.preventDefault();

    try {
      await createTable({
        ...formData,

        restaurant_id: activeRestaurant.id,
      });

      fetchTableList();

      setShowCreateModal(false);

      setFormData({
        table_number: "",
        capacity: "",
        floor: "",
        area: "",
        status: "available",
      });

      setAlert({
        type: "success",
        message: "Table created successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to create table.",
      });
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (table) => {
    setSelectedTable(table);

    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      floor: table.floor,
      area: table.area,
      status: table.status,
      assigned_waiter: table.assigned_waiter || "",
    });

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE TABLE
  // ==========================================
  const handleUpdateTable = async (e) => {
    e.preventDefault();

    try {
      await updateTable(selectedTable.id, formData);

      fetchTableList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Table updated successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update table.",
      });
    }
  };

  // ==========================================
  // ACTIVE / INACTIVE TABLE
  // ==========================================
  const handleToggleStatus = async (tableId) => {
    try {
      const response = await toggleTableStatus(tableId);

      fetchTableList();

      setAlert({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to change table status.",
      });
    }
  };

  // ==========================================
  // DELETE TABLE
  // ==========================================
  const handleDeleteTable = async (tableId) => {
    const confirmDelete = window.confirm("Delete this table permanently?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteTable(tableId);

      fetchTableList();

      setAlert({
        type: "success",
        message: "Table deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete table.",
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
        <h2 className="fw-bold">Table Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Table
        </button>
      </div>

      {/* ==========================================
          TABLE LIST
      ========================================== */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Table No.</th>
                <th>Capacity</th>
                <th>Floor</th>
                <th>Area</th>
                <th>Assigned Waiter</th>
                <th>Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableList.map((table) => (
                <tr key={table.id}>
                  <td>{table.table_number}</td>

                  <td>{table.capacity}</td>

                  <td>{table.floor_name}</td>
                  <td>{table.area_name}</td>
                  <td>{table.waiter_name || "None"}</td>
                  <td>
                    <span
                      className={`badge ${
                        table.status === "available"
                          ? "bg-success"
                          : table.status === "occupied"
                            ? "bg-danger"
                            : "bg-warning"
                      }`}
                    >
                      {table.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        table.is_active ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {table.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {/* EDIT */}
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(table)}
                    >
                      Edit
                    </button>

                    {/* ACTIVE / INACTIVE */}
                    <button
                      className={`btn btn-sm me-2 ${
                        table.is_active ? "btn-secondary" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(table.id)}
                    >
                      {table.is_active ? "Deactivate" : "Activate"}
                    </button>

                    {/* DELETE */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteTable(table.id)}
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
          title="Create Table"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTable}
        >
          <TableForm
            formData={formData}
            handleChange={handleChange}
            floorList={floorList}
            areaList={areaList}
            waiterList={waiterList}
            showWaiter={false}
          />
        </ModalWrapper>
      )}

      {/* ==========================================
          EDIT MODAL
      ========================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Table"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTable}
        >
          <TableForm
            formData={formData}
            handleChange={handleChange}
            floorList={floorList}
            areaList={areaList}
            waiterList={waiterList}
            showWaiter={true}
          />
        </ModalWrapper>
      )}

    
    </div>
  );
}

// ==========================================
// TABLE FORM
// ==========================================
function TableForm({
  formData,
  handleChange,
  floorList,
  areaList,
  waiterList,
  showWaiter,
}) {
  return (
    <>
      {/* TABLE NUMBER */}
      <InputField
        label="Table Number"
        name="table_number"
        value={formData.table_number}
        handleChange={handleChange}
      />

      {/* CAPACITY */}
      <InputField
        label="Capacity"
        name="capacity"
        value={formData.capacity}
        handleChange={handleChange}
        type="number"
      />

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
          <option value="">Select FLoor</option>

          {floorList.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.name}
            </option>
          ))}
        </select>
      </div>
      {/* AREA */}
      <div className="mb-3">
        <label className="form-label">Area</label>

        <select
          className="form-select"
          name="area"
          value={formData.area}
          onChange={handleChange}
          required
        >
          <option value="">Select Area</option>

          {areaList.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS */}
      <div className="mb-3">
        <label className="form-label">Table Status</label>

        <select
          className="form-select"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="available">Available</option>

          <option value="occupied">Occupied</option>

          <option value="reserved">Reserved</option>

          <option value="cleaning">Cleaning</option>
        </select>
      </div>

      {/* WAITER (ONLY FOR EDIT) */}
      {showWaiter && (
        <div className="mb-3">
          <label className="form-label">Assign Waiter</label>

          <select
            className="form-select"
            name="assigned_waiter"
            value={formData.assigned_waiter || ""}
            onChange={handleChange}
          >
            <option value="">None</option>

            {waiterList
              .filter((w) => w.is_active)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.username}
                </option>
              ))}
          </select>
        </div>
      )}
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
