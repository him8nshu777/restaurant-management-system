// src/pages/menu/Variants.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getVariantList,
  createVariant,
  updateVariant,
  deleteVariant,
  toggleVariantStatus,
  getProductList,
} from "../../../services/menuService";

// ======================================================
// VARIANT MANAGEMENT PAGE
// ======================================================
export default function Variants() {
  // ==================================================
  // VARIANT LIST
  // ==================================================
  const [variantList, setVariantList] = useState([]);

  // ==================================================
  // PRODUCT LIST
  // ==================================================
  const [productList, setProductList] = useState([]);

  // ==================================================
  // MODAL STATES
  // ==================================================
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  // ==================================================
  // SELECTED VARIANT
  // ==================================================
  const [selectedVariant, setSelectedVariant] = useState(null);

  // ==================================================
  // ALERT STATE
  // ==================================================
  const [alert, setAlert] = useState(null);

  // ==================================================
  // FORM DATA
  // ==================================================
  const [formData, setFormData] = useState({
    product: "",
    name: "Small",
    price: "",
    stock: "",
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
      fetchVariants();

      fetchProducts();
    }
  }, [activeRestaurant]);

  // ==================================================
  // FETCH VARIANTS
  // ==================================================
  const fetchVariants = async () => {
    try {
      const data = await getVariantList(activeRestaurant.id);

      setVariantList(data);
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to fetch variants.",
      });
    }
  };

  // ==================================================
  // FETCH PRODUCTS
  // ==================================================
  const fetchProducts = async () => {
    try {
      const data = await getProductList(activeRestaurant.id);

      setProductList(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // HANDLE INPUT CHANGE
  // ==================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ==================================================
  // RESET FORM
  // ==================================================
  const resetForm = () => {
    setFormData({
      product: "",
      name: "Small",
      price: "",
      stock: "",
    });
  };

  // ==================================================
  // CREATE VARIANT
  // ==================================================
  const handleCreateVariant = async (e) => {
    e.preventDefault();

    try {
      await createVariant({
        restaurant: activeRestaurant.id,
        product: formData.product,
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      fetchVariants();

      setShowCreateModal(false);

      resetForm();

      setAlert({
        type: "success",
        message: "Variant created successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to create variant.",
      });
    }
  };

  // ==================================================
  // OPEN EDIT MODAL
  // ==================================================
  const openEditModal = (variant) => {
    setSelectedVariant(variant);

    setFormData({
      product: variant.product,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
    });

    setShowEditModal(true);
  };

  // ==================================================
  // UPDATE VARIANT
  // ==================================================
  const handleUpdateVariant = async (e) => {
    e.preventDefault();

    try {
      await updateVariant(selectedVariant.id, {
        product: formData.product,
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      fetchVariants();

      setShowEditModal(false);

      resetForm();

      setAlert({
        type: "success",
        message: "Variant updated successfully.",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to update variant.",
      });
    }
  };

  // ==================================================
  // DELETE VARIANT
  // ==================================================
  const handleDeleteVariant = async (variantId) => {
    const confirmDelete = window.confirm("Delete this variant?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteVariant(variantId);

      fetchVariants();

      setAlert({
        type: "success",
        message: "Variant deleted successfully.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to delete variant.",
      });
    }
  };

  // ==================================================
  // TOGGLE STATUS
  // ==================================================
  const handleToggleStatus = async (variantId) => {
    try {
      await toggleVariantStatus(variantId);

      fetchVariants();

      setAlert({
        type: "success",
        message: "Variant status updated.",
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to update variant status.",
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

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Variant Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Variant
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {variantList.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.product_name}</td>

                  <td>{variant.name}</td>

                  <td>₹{variant.price}</td>

                  <td>{variant.stock}</td>

                  <td>
                    <span
                      className={`badge ${
                        variant.is_available
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {variant.is_available
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(variant)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() =>
                        handleDeleteVariant(variant.id)
                      }
                    >
                      Delete
                    </button>

                    <button
                      className={`btn btn-sm ${
                        variant.is_available
                          ? "btn-secondary"
                          : "btn-success"
                      }`}
                      onClick={() =>
                        handleToggleStatus(variant.id)
                      }
                    >
                      {variant.is_available
                        ? "Disable"
                        : "Enable"}
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
          title="Create Variant"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateVariant}
        >
          <SelectField
            label="Product"
            name="product"
            value={formData.product}
            handleChange={handleChange}
            options={productList}
          />

          <InputField
            label="Variant Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            handleChange={handleChange}
          />

          <InputField
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            handleChange={handleChange}
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Variant"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateVariant}
        >
          <SelectField
            label="Product"
            name="product"
            value={formData.product}
            handleChange={handleChange}
            options={productList}
          />

          <InputField
            label="Variant Name"
            name="name"
            value={formData.name}
            handleChange={handleChange}
          />

          <InputField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            handleChange={handleChange}
          />

          <InputField
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
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

            <button
              className="btn-close"
              onClick={onClose}
            ></button>
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
// SELECT FIELD
// ======================================================
function SelectField({
  label,
  name,
  value,
  handleChange,
  options,
}) {
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
        <option value="">
          Select Product
        </option>

        {options.map((option) => (
          <option
            key={option.id}
            value={option.id}
          >
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}