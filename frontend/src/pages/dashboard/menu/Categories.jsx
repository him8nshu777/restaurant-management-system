// src/pages/menu/Categories.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  createCategory,
  getCategoryList,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../../../services/menuService";

// ======================================================
// CATEGORY MANAGEMENT PAGE
// ======================================================
export default function Categories() {
  // ==================================================
  // CATEGORY LIST
  // ==================================================
  const [categoryList, setCategoryList] = useState([]);

  // ==================================================
  // ALERT STATE
  // ==================================================
  const [alert, setAlert] = useState(null);

  // ==================================================
  // CREATE MODAL
  // ==================================================
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ==================================================
  // EDIT MODAL
  // ==================================================
  const [showEditModal, setShowEditModal] = useState(false);

  // ==================================================
  // SELECTED CATEGORY
  // ==================================================
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ==================================================
  // FORM DATA
  // ==================================================
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  // ==================================================
  // ACTIVE RESTAURANT
  // ==================================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ==================================================
  // FETCH CATEGORIES
  // ==================================================
  useEffect(() => {
    if (activeRestaurant?.id) {
      fetchCategoryList();
    }
  }, [activeRestaurant]);

  // ==================================================
  // GET CATEGORY LIST
  // ==================================================
  const fetchCategoryList = async () => {
    try {
      const data = await getCategoryList(activeRestaurant.id);

      setCategoryList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch categories.",
      });
    }
  };

  // ==================================================
  // HANDLE INPUT CHANGE
  // ==================================================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // ==============================================
    // IMAGE FIELD
    // ==============================================
    if (name === "image") {
      setFormData({
        ...formData,
        image: files[0],
      });

      return;
    }

    // ==============================================
    // TEXT FIELD
    // ==============================================
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ==================================================
  // CREATE CATEGORY
  // ==================================================
  const handleCreateCategory = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("restaurant", activeRestaurant.id);

      payload.append("name", formData.name);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      await createCategory(payload);

      fetchCategoryList();

      setShowCreateModal(false);

      setFormData({
        name: "",
        image: null,
      });

      setAlert({
        type: "success",
        message: "Category created successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to create category.",
      });
    }
  };

  // ==================================================
  // OPEN EDIT MODAL
  // ==================================================
  const openEditModal = (category) => {
    setSelectedCategory(category);

    setFormData({
      name: category.name,
      image: null,
    });

    setShowEditModal(true);
  };

  // ==================================================
  // UPDATE CATEGORY
  // ==================================================
  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("name", formData.name);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      await updateCategory(selectedCategory.id, payload);

      fetchCategoryList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Category updated successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to update category.",
      });
    }
  };

  // ==================================================
  // DELETE CATEGORY
  // ==================================================
  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm("Delete this category?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCategory(categoryId);

      fetchCategoryList();

      setAlert({
        type: "success",
        message: "Category deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete category.",
      });
    }
  };

  // ==================================================
  // TOGGLE STATUS
  // ==================================================
  const handleToggleStatus = async (categoryId) => {
    try {
      await toggleCategoryStatus(categoryId);

      fetchCategoryList();

      setAlert({
        type: "success",
        message: "Category status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update status.",
      });
    }
  };

  return (
    <div>
      {/* ======================================
                ALERT
            ====================================== */}
      {alert && (
        <div
          className={`
                        alert
                        alert-${alert.type}
                    `}
        >
          {alert.message}
        </div>
      )}

      {/* ======================================
                PAGE HEADER
            ====================================== */}
      <div
        className="
                    d-flex
                    justify-content-between
                    align-items-center
                    mb-4
                "
      >
        <h2 className="fw-bold">Category Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Category
        </button>
      </div>

      {/* ======================================
                CATEGORY TABLE
            ====================================== */}
      <div
        className="
                    card
                    border-0
                    shadow-sm
                "
      >
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Image</th>

                <th>Name</th>

                <th>Status</th>

                <th>Created</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categoryList.map((category) => (
                <tr key={category.id}>
                  {/* IMAGE */}
                  <td>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        width="60"
                        height="60"
                        className="rounded object-fit-cover"
                      />
                    ) : (
                      <div
                        className="
                                                    bg-light
                                                    rounded
                                                    d-flex
                                                    align-items-center
                                                    justify-content-center
                                                "
                        style={{
                          width: "60px",
                          height: "60px",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>

                  {/* NAME */}
                  <td>{category.name}</td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`
                                                badge
                                                ${
                                                  category.is_active
                                                    ? "bg-success"
                                                    : "bg-danger"
                                                }
                                            `}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* CREATED */}
                  <td>{new Date(category.created_at).toLocaleDateString()}</td>

                  {/* ACTIONS */}
                  <td>
                    {/* EDIT */}
                    <button
                      className="
                                                btn
                                                btn-warning
                                                btn-sm
                                                me-2
                                            "
                      onClick={() => openEditModal(category)}
                    >
                      Edit
                    </button>

                    {/* TOGGLE */}
                    <button
                      className={`
                                                btn
                                                btn-sm
                                                me-2

                                                ${
                                                  category.is_active
                                                    ? "btn-secondary"
                                                    : "btn-success"
                                                }
                                            `}
                      onClick={() => handleToggleStatus(category.id)}
                    >
                      {category.is_active ? "Deactivate" : "Activate"}
                    </button>

                    {/* DELETE */}
                    <button
                      className="
                                                btn
                                                btn-danger
                                                btn-sm
                                            "
                      onClick={() => handleDeleteCategory(category.id)}
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

      {/* ======================================
                CREATE MODAL
            ====================================== */}
      {showCreateModal && (
        <ModalWrapper
          title="Create Category"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCategory}
        >
          <InputField
            label="Category Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <ImageField
            label="Category Image"
            name="image"
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}

      {/* ======================================
                EDIT MODAL
            ====================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Category"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateCategory}
        >
          <InputField
            label="Category Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <ImageField
            label="Update Image"
            name="image"
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}
    </div>
  );
}

// ======================================================
// REUSABLE MODAL
// ======================================================
function ModalWrapper({ title, children, onClose, onSubmit }) {
  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* FORM */}
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

// ======================================================
// REUSABLE INPUT FIELD
// ======================================================
function InputField({ label, name, value, handleChange }) {
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

// ======================================================
// REUSABLE IMAGE FIELD
// ======================================================
function ImageField({ label, name, handleChange }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

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
