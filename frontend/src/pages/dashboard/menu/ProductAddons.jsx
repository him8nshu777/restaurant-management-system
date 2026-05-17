// src/pages/menu/ProductAddons.jsx

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getProductList,
  getAddonList,
  getProductAddonList,
  createProductAddon,
  deleteProductAddon,
} from "../../../services/menuService";

// ======================================================
// PRODUCT ADDON MAPPING MANAGEMENT
// ======================================================
export default function ProductAddons() {
  // ====================================================
  // STATES
  // ====================================================
  const [mappingList, setMappingList] = useState([]);

  const [productList, setProductList] = useState([]);

  const [addonList, setAddonList] = useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    product: "",
    addon: "",
  });

  // ====================================================
  // ACTIVE RESTAURANT
  // ====================================================
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
  // FETCH PRODUCTS + ADDONS
  // ====================================================
 const fetchInitialData = async () => {
  try {

    const products = await getProductList(
      activeRestaurant.id,
    );

    const addons = await getAddonList(
      activeRestaurant.id,
    );

    const mappings =
      await getProductAddonList(
        activeRestaurant.id,
      );

    setProductList(products);

    setAddonList(addons);

    setMappingList(mappings);

  } catch (error) {

    console.log(error);

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
      await createProductAddon({
        product: formData.product,
        addon: formData.addon,
      });

      await fetchInitialData();

      setShowCreateModal(false);

      setFormData({
        product: "",
        addon: "",
      });

      setAlert({
        type: "success",
        message: "Addon mapped successfully",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message:
          error.response?.data?.message ||
          "Failed to create mapping",
      });
    }
  };

  // ====================================================
  // DELETE MAPPING
  // ====================================================
  const handleDeleteMapping = async (
    mappingId,
    productId,
  ) => {
    const confirmDelete = window.confirm(
      "Remove this addon mapping?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteProductAddon(mappingId);

      await fetchInitialData();

      setAlert({
        type: "success",
        message: "Mapping removed successfully",
      });
    } catch (error) {
      console.log(error.response?.data);

      setAlert({
        type: "danger",
        message: "Failed to remove mapping",
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
          Product Addon Mapping
        </h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Mapping
        </button>
      </div>

      {/* PRODUCT SECTIONS */}
      {productList.map((product) => (
        <div
          key={product.id}
          className="card border-0 shadow-sm mb-4"
        >
          <div className="card-body">
            {/* PRODUCT HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  {product.name}
                </h5>

                <div className="text-muted small">
                  ₹{product.base_price}
                </div>
              </div>

            </div>

            {/* TABLE */}
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Addon</th>

                  <th>Price</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {mappingList.filter(
                  (item) =>
                    item.product === product.id,
                ).length > 0 ? (
                  mappingList
                    .filter(
                      (item) =>
                        item.product === product.id,
                    )
                    .map((mapping) => (
                      <tr key={mapping.id}>
                        <td>
                          {mapping.addon_name}
                        </td>

                        <td>
                          ₹{mapping.addon_price}
                        </td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDeleteMapping(
                                mapping.id,
                                product.id,
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center text-muted"
                    >
                      No addons mapped
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ==================================================
          CREATE MODAL
      ================================================== */}
      {showCreateModal && (
        <ModalWrapper
          title="Create Product Addon Mapping"
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateMapping}
        >
          {/* PRODUCT */}
          <SelectField
            label="Select Product"
            name="product"
            value={formData.product}
            handleChange={handleChange}
            options={productList}
          />

          {/* ADDON */}
          <SelectField
            label="Select Addon"
            name="addon"
            value={formData.addon}
            handleChange={handleChange}
            options={addonList}
            isAddon
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
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">
              {title}
            </h5>

            <button
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* FORM */}
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
  isAddon = false,
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
            {isAddon
              ? `${item.name} - ₹${item.price}`
              : item.name}
          </option>
        ))}
      </select>
    </div>
  );
}