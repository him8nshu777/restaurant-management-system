// src/pages/menu/Products.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getCategoryList,
} from "../../../services/menuService";

// ======================================================
// PRODUCT MANAGEMENT PAGE
// ======================================================
export default function Products() {
  // ==================================================
  // PRODUCT LIST
  // ==================================================
  const [productList, setProductList] = useState([]);

  // ==================================================
  // CATEGORY LIST
  // ==================================================
  const [categoryList, setCategoryList] = useState([]);

  // ==================================================
  // MODAL STATES
  // ==================================================
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  // ==================================================
  // SELECTED PRODUCT
  // ==================================================
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ==================================================
  // ALERT STATE
  // ==================================================
  const [alert, setAlert] = useState(null);

  // ==================================================
  // FORM DATA
  // ==================================================
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    image: null,
    base_price: "",
    is_veg: false,
    preparation_time: 15,
  });

  // ==================================================
  // ACTIVE RESTAURANT
  // ==================================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ==================================================
  // FETCH DATA
  // ==================================================
  useEffect(() => {
    if (activeRestaurant?.id) {
      fetchProductList();

      fetchCategoryList();
    }
  }, [activeRestaurant]);

  // ==================================================
  // FETCH PRODUCTS
  // ==================================================
  const fetchProductList = async () => {
    try {
      const data = await getProductList(activeRestaurant.id);

      setProductList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch products.",
      });
    }
  };

  // ==================================================
  // FETCH CATEGORIES
  // ==================================================
  const fetchCategoryList = async () => {
    try {
      const data = await getCategoryList(activeRestaurant.id);

      setCategoryList(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // HANDLE INPUT CHANGE
  // ==================================================
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData({
      ...formData,

      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  // ==================================================
  // CREATE PRODUCT
  // ==================================================
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("restaurant", activeRestaurant.id);

      payload.append("category", formData.category);

      payload.append("name", formData.name);

      payload.append("description", formData.description);

      payload.append("base_price", formData.base_price);

      payload.append("is_veg", formData.is_veg);

      payload.append("preparation_time", formData.preparation_time);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      await createProduct(payload);

      fetchProductList();

      setShowCreateModal(false);

      setFormData({
        category: "",
        name: "",
        description: "",
        image: null,
        base_price: "",
        is_veg: false,
        preparation_time: 15,
      });

      setAlert({
        type: "success",
        message: "Product created successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to create product.",
      });
    }
  };

  // ==================================================
  // OPEN EDIT MODAL
  // ==================================================
  const openEditModal = (product) => {
    setSelectedProduct(product);

    setFormData({
      category: product.category,
      name: product.name,
      description: product.description,
      image: null,
      base_price: product.base_price,
      is_veg: product.is_veg,
      preparation_time: product.preparation_time,
    });

    setShowEditModal(true);
  };

  // ==================================================
  // UPDATE PRODUCT
  // ==================================================
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("category", formData.category);

      payload.append("name", formData.name);

      payload.append("description", formData.description);

      payload.append("base_price", formData.base_price);

      payload.append("is_veg", formData.is_veg);

      payload.append("preparation_time", formData.preparation_time);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      await updateProduct(selectedProduct.id, payload);

      fetchProductList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Product updated successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to update product.",
      });
    }
  };

  // ==================================================
  // DELETE PRODUCT
  // ==================================================
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteProduct(productId);

      fetchProductList();

      setAlert({
        type: "success",
        message: "Product deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete product.",
      });
    }
  };

  // ==================================================
  // TOGGLE PRODUCT STATUS
  // ==================================================
  const handleToggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);

      fetchProductList();

      setAlert({
        type: "success",
        message: "Product status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update product status.",
      });
    }
  };

  return (
    <div>
      {/* ======================================
            ALERT
      ====================================== */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      {/* ======================================
            PAGE HEADER
      ====================================== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Product Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Product
        </button>
      </div>

      {/* ======================================
            PRODUCT TABLE
      ====================================== */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Image</th>

                <th>Name</th>

                <th>Category</th>

                <th>Price</th>

                <th>Veg</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {productList.map((product) => (
                <tr key={product.id}>
                  {/* IMAGE */}
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        width="60"
                        height="60"
                        className="rounded"
                        style={{
                          objectFit: "cover",
                        }}
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
                  <td>{product.name}</td>

                  {/* CATEGORY */}
                  <td>{product.category_name}</td>

                  {/* PRICE */}
                  <td>₹{product.base_price}</td>

                  {/* VEG */}
                  <td>{product.is_veg ? "Veg" : "Non Veg"}</td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`badge ${
                        product.is_available ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {product.is_available ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>

                    <button
                      className={`btn btn-sm ${
                        product.is_available ? "btn-secondary" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(product.id)}
                    >
                      {product.is_available ? "Disable" : "Enable"}
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
          title="Create Product"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProduct}
        >
          <InputField
            label="Product Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            handleChange={handleChange}
          />

          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            handleChange={handleChange}
            options={categoryList}
          />

          <InputField
            label="Base Price"
            name="base_price"
            value={formData.base_price}
            handleChange={handleChange}
            type="number"
          />

          <InputField
            label="Preparation Time"
            name="preparation_time"
            value={formData.preparation_time}
            handleChange={handleChange}
            type="number"
          />

          <ImageField
            label="Product Image"
            name="image"
            handleChange={handleChange}
          />

          <CheckboxField
            label="Veg Product"
            name="is_veg"
            checked={formData.is_veg}
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}

      {/* ======================================
            EDIT MODAL
      ====================================== */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Product"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProduct}
        >
          <InputField
            label="Product Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            handleChange={handleChange}
          />

          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            handleChange={handleChange}
            options={categoryList}
          />

          <InputField
            label="Base Price"
            name="base_price"
            value={formData.base_price}
            handleChange={handleChange}
            type="number"
          />

          <InputField
            label="Preparation Time"
            name="preparation_time"
            value={formData.preparation_time}
            handleChange={handleChange}
            type="number"
          />

          <ImageField
            label="Update Image"
            name="image"
            handleChange={handleChange}
          />

          <CheckboxField
            label="Veg Product"
            name="is_veg"
            checked={formData.is_veg}
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}
    </div>
  );
}

// ======================================================
// MODAL WRAPPER
// ======================================================
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

// ======================================================
// INPUT FIELD
// ======================================================
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

// ======================================================
// TEXTAREA FIELD
// ======================================================
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

// ======================================================
// IMAGE FIELD
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

// ======================================================
// CHECKBOX FIELD
// ======================================================
function CheckboxField({ label, name, checked, handleChange }) {
  return (
    <div className="form-check mb-3">
      <input
        type="checkbox"
        className="form-check-input"
        name={name}
        checked={checked}
        onChange={handleChange}
      />

      <label className="form-check-label">{label}</label>
    </div>
  );
}

// ======================================================
// SELECT FIELD
// ======================================================
function SelectField({ label, name, value, handleChange, options }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <select
        className="form-select"
        name={name}
        value={value}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>

        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
