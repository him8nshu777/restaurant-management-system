// src/pages/menu/ProductDynamicPricing.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getProductList,
  getDynamicPricingList,
  getProductDynamicPricingList,
  createProductDynamicPricing,
  updateProductDynamicPricing,
  deleteProductDynamicPricing,
} from "../../../services/menuService";

// ======================================================
// PRODUCT DYNAMIC PRICING
// ======================================================
export default function ProductDynamicPricing() {

  const [mappingList, setMappingList] =
    useState([]);

  const [productList, setProductList] =
    useState([]);

  const [pricingList, setPricingList] =
    useState([]);

  const [alert, setAlert] =
    useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedMapping, setSelectedMapping] =
    useState(null);

  const [formData, setFormData] =
    useState({
      product: "",
      dynamic_pricing: "",
    });

  const activeRestaurant = useSelector(
    (state) =>
      state.restaurant.activeRestaurant,
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

      const products =
        await getProductList(
          activeRestaurant.id,
        );

      const pricings =
        await getDynamicPricingList(
          activeRestaurant.id,
        );

      const mappings =
        await getProductDynamicPricingList(
          activeRestaurant.id,
        );

      setProductList(products);

      setPricingList(pricings);

      setMappingList(mappings);

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to load data",
      });
    }
  };

  // ====================================================
  // HANDLE CHANGE
  // ====================================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // ====================================================
  // CREATE
  // ====================================================
  const handleCreate = async (e) => {

    e.preventDefault();

    try {

      await createProductDynamicPricing(
        formData,
      );

      fetchInitialData();

      setShowCreateModal(false);

      setFormData({
        product: "",
        dynamic_pricing: "",
      });

      setAlert({
        type: "success",
        message:
          "Mapping created successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          error.response?.data
            ?.message ||
          "Mapping already exists",
      });
    }
  };

  // ====================================================
  // OPEN EDIT
  // ====================================================
  const openEditModal = (mapping) => {

    setSelectedMapping(mapping);

    setFormData({
      product: mapping.product,
      dynamic_pricing:
        mapping.dynamic_pricing,
    });

    setShowEditModal(true);
  };

  // ====================================================
  // UPDATE
  // ====================================================
  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      await updateProductDynamicPricing(
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
          error.response?.data
            ?.message ||
          "Failed to update mapping",
      });
    }
  };

  // ====================================================
  // DELETE
  // ====================================================
  const handleDelete = async (
    mappingId,
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this mapping?",
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteProductDynamicPricing(
        mappingId,
      );

      fetchInitialData();

      setAlert({
        type: "success",
        message:
          "Mapping deleted successfully",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message:
          "Failed to delete mapping",
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
          Product Dynamic Pricing
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
                <th>Pricing Rule</th>
                <th>Type</th>
                <th>Value</th>
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
                    {mapping.dynamic_pricing_name}
                  </td>

                  <td>
                    {mapping.pricing_type}
                  </td>

                  <td>
                    {mapping.pricing_value}
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
                        handleDelete(
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

      {/* CREATE */}
      {showCreateModal && (
        <MappingModal
          title="Create Product Pricing Mapping"
          formData={formData}
          handleChange={handleChange}
          productList={productList}
          pricingList={pricingList}
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreate}
        />
      )}

      {/* EDIT */}
      {showEditModal && (
        <MappingModal
          title="Edit Product Pricing Mapping"
          formData={formData}
          handleChange={handleChange}
          productList={productList}
          pricingList={pricingList}
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}

// ======================================================
// MODAL
// ======================================================
function MappingModal({
  title,
  formData,
  handleChange,
  productList,
  pricingList,
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
            />
          </div>

          <form onSubmit={onSubmit}>

            <div className="modal-body">

              <SelectField
                label="Product"
                name="product"
                value={formData.product}
                handleChange={handleChange}
                options={productList}
              />

              <SelectField
                label="Dynamic Pricing"
                name="dynamic_pricing"
                value={
                  formData.dynamic_pricing
                }
                handleChange={handleChange}
                options={pricingList}
              />
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