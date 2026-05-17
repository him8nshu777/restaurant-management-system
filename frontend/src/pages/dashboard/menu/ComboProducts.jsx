// src/pages/menu/ComboProducts.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getComboList,
  getProductList,
  getComboProductList,
  createComboProduct,
  deleteComboProduct,
  updateComboProduct,
} from "../../../services/menuService";

// ======================================================
// COMBO PRODUCT MAPPING
// ======================================================
export default function ComboProducts() {

  const [comboList, setComboList] = useState([]);

  const [productList, setProductList] = useState([]);

  const [mappingList, setMappingList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedMapping, setSelectedMapping] =
    useState(null);

  const [formData, setFormData] = useState({
    combo: "",
    product: "",
    quantity: 1,
  });

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  // ====================================================
  // FETCH DATA
  // ====================================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchInitialData();
    }

  }, [activeRestaurant]);

  // ====================================================
  // FETCH INITIAL DATA
  // ====================================================
  const fetchInitialData = async () => {

    try {

      const combos = await getComboList(
        activeRestaurant.id,
      );

      const products = await getProductList(
        activeRestaurant.id,
      );

      const mappings =
        await getComboProductList(
          activeRestaurant.id,
        );

      setComboList(combos);

      setProductList(products);

      setMappingList(mappings);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to load data",
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
  // CREATE MAPPING
  // ====================================================
  const handleCreateMapping = async (e) => {

    e.preventDefault();

    try {

      const response =
        await createComboProduct(formData);

      fetchInitialData();

      setShowCreateModal(false);

      setFormData({
        combo: "",
        product: "",
        quantity: 1,
      });

      setAlert({
        type: "success",
        message:
          response.message ||
          "Product mapped successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          error.response?.data?.message ||
          "Failed to create mapping",
      });
    }
  };

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================
  const openEditModal = (mapping) => {

    setSelectedMapping(mapping);

    setFormData({
      combo: mapping.combo,
      product: mapping.product,
      quantity: mapping.quantity,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE MAPPING
  // ====================================================
  const handleUpdateMapping = async (e) => {

    e.preventDefault();

    try {

      const response =
        await updateComboProduct(
          selectedMapping.id,
          {
            quantity: formData.quantity,
          },
        );

      fetchInitialData();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message:
          response.message ||
          "Mapping updated successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to update mapping",
      });
    }
  };

  // ====================================================
  // DELETE MAPPING
  // ====================================================
  const handleDeleteMapping = async (
    mappingId,
  ) => {

    const confirmDelete = window.confirm(
      "Remove this mapping?",
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteComboProduct(
        mappingId,
      );

      fetchInitialData();

      setAlert({
        type: "success",
        message:
          "Mapping removed successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to remove mapping",
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
          Combo Product Mapping
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Create Mapping
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Combo</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {mappingList.map((mapping) => (

                <tr key={mapping.id}>

                  <td>
                    {mapping.combo_name}
                  </td>

                  <td>
                    {mapping.product_name}
                  </td>

                  <td>
                    {mapping.quantity}
                  </td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        openEditModal(mapping)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDeleteMapping(
                          mapping.id,
                        )
                      }
                    >
                      Remove
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
          title="Create Combo Product Mapping"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateMapping}
        >
          <SelectField
            label="Combo"
            name="combo"
            value={formData.combo}
            handleChange={handleChange}
            options={comboList}
          />

          <SelectField
            label="Product"
            name="product"
            value={formData.product}
            handleChange={handleChange}
            options={productList}
          />

          <InputField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            handleChange={handleChange}
            type="number"
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Quantity"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdateMapping}
        >
          <InputField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
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

      <label className="form-label">
        {label}
      </label>

      <select
        className="form-select"
        name={name}
        value={value}
        onChange={handleChange}
        required
      >
        <option value="">
          Choose {label}
        </option>

        {options.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}