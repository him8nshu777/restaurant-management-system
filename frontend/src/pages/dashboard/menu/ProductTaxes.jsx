// src/pages/menu/ProductTaxes.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getProductList,
  getTaxList,
  getProductTaxList,
  createProductTax,
  updateProductTax,
  deleteProductTax,
} from "../../../services/menuService";

// ======================================================
// PRODUCT TAX MAPPING
// ======================================================
export default function ProductTaxes() {

  const [mappingList, setMappingList] =
    useState([]);

  const [productList, setProductList] =
    useState([]);

  const [taxList, setTaxList] =
    useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedMapping, setSelectedMapping] =
    useState(null);

  const [formData, setFormData] = useState({
    product: "",
    tax: "",
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

      const products = await getProductList(
        activeRestaurant.id,
      );

      const taxes = await getTaxList(
        activeRestaurant.id,
      );

      const mappings =
        await getProductTaxList(
          activeRestaurant.id,
        );

      setProductList(products);

      setTaxList(taxes);

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

      await createProductTax(formData);

      fetchInitialData();

      setShowCreateModal(false);

      setFormData({
        product: "",
        tax: "",
      });

      setAlert({
        type: "success",
        message:
          "Tax mapped successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          error.response?.data?.message ||
            "Failed to update mapping",
      });
    }
  };

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================
  const openEditModal = (mapping) => {

    setSelectedMapping(mapping);

    setFormData({
      product: mapping.product,
      tax: mapping.tax,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE MAPPING
  // ====================================================
  const handleUpdateMapping = async (e) => {

    e.preventDefault();

    try {

      await updateProductTax(
        selectedMapping.id,
        formData,
      );

      fetchInitialData();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message:
          "Mapping updated successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          error.response?.data?.message ||
      "This tax mapping already exists",
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
      "Delete this mapping?",
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteProductTax(
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
          Product Tax Mapping
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
                <th>Product</th>
                <th>Tax</th>
                <th>Percentage</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {mappingList.map((mapping) => (

                <tr key={mapping.id}>

                  <td>
                    {mapping.product_name}
                  </td>

                  <td>
                    {mapping.tax_name}
                  </td>

                  <td>
                    {mapping.tax_percentage}%
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
          title="Create Product Tax Mapping"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateMapping}
        >
          <SelectField
            label="Product"
            name="product"
            value={formData.product}
            handleChange={handleChange}
            options={productList}
          />

          <SelectField
            label="Tax"
            name="tax"
            value={formData.tax}
            handleChange={handleChange}
            options={taxList}
          />
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Product Tax Mapping"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdateMapping}
        >
          <SelectField
            label="Product"
            name="product"
            value={formData.product}
            handleChange={handleChange}
            options={productList}
          />

          <SelectField
            label="Tax"
            name="tax"
            value={formData.tax}
            handleChange={handleChange}
            options={taxList}
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