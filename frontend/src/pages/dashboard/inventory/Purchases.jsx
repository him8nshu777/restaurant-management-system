import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getPurchaseList,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getSupplierList,
} from "../../../services/inventoryService";

export default function Purchases() {

  const [purchaseList, setPurchaseList] =
    useState([]);

  const [supplierList, setSupplierList] =
    useState([]);

  const [alert, setAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedPurchase, setSelectedPurchase] =
    useState(null);

  const [formData, setFormData] = useState({
    supplier: "",
    invoice_number: "",
    total_amount: "",
    purchase_date: "",
  });

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );
    const user = useSelector(
  (state) => state.auth.user
);

// ==========================================
// RESTAURANT ID
// ==========================================
const restaurantId =
  user?.role === "restaurant_admin"
    ? activeRestaurant?.id
    : user?.restaurant_id;

  useEffect(() => {

    if (restaurantId) {

      fetchPurchaseList();

      fetchSupplierList();
    }

  }, [restaurantId]);

  const fetchPurchaseList = async () => {

    try {

      const data =
        await getPurchaseList(
          restaurantId
        );

      setPurchaseList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to fetch purchases.",
      });
    }
  };

  const fetchSupplierList = async () => {

    try {

      const data =
        await getSupplierList(
          restaurantId
        );

      setSupplierList(data);

    } catch (error) {

      console.log(error);
    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleCreatePurchase = async (e) => {

    e.preventDefault();

    try {

      await createPurchase({
        ...formData,

        restaurant_id: restaurantId
      });

      fetchPurchaseList();

      setShowCreateModal(false);

      setFormData({
        supplier: "",
        invoice_number: "",
        total_amount: "",
        purchase_date: "",
      });

      setAlert({
        type: "success",
        message: "Purchase created successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create purchase.",
      });
    }
  };

  const openEditModal = (purchase) => {

    setSelectedPurchase(purchase);

    setFormData({
      supplier: purchase.supplier,
      invoice_number: purchase.invoice_number,
      total_amount: purchase.total_amount,
      purchase_date: purchase.purchase_date,
    });

    setShowEditModal(true);
  };

  const handleUpdatePurchase = async (e) => {

    e.preventDefault();

    try {

      await updatePurchase(
        selectedPurchase.id,
        formData
      );

      fetchPurchaseList();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Purchase updated successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to update purchase.",
      });
    }
  };

  const handleDeletePurchase = async (
    purchaseId
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this purchase?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await deletePurchase(purchaseId);

      fetchPurchaseList();

      setAlert({
        type: "success",
        message: "Purchase deleted successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to delete purchase.",
      });
    }
  };

  return (
    <div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="d-flex justify-content-between mb-4">

        <h2 className="fw-bold">
          Purchase Management
        </h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Purchase
        </button>

      </div>

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table">

            <thead>
              <tr>
                <th>Supplier</th>
                <th>Invoice</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {purchaseList.map((purchase) => (

                <tr key={purchase.id}>

                  <td>
                    {purchase.supplier_name}
                  </td>

                  <td>
                    {purchase.invoice_number || "-"}
                  </td>

                  <td>
                    ₹{purchase.total_amount}
                  </td>

                  <td>
                    {purchase.purchase_date}
                  </td>

                  <td>

                    <button
                      className="
                        btn
                        btn-warning
                        btn-sm
                        me-2
                      "
                      onClick={() =>
                        openEditModal(purchase)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="
                        btn
                        btn-danger
                        btn-sm
                      "
                      onClick={() =>
                        handleDeletePurchase(
                          purchase.id
                        )
                      }
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

      {/* CREATE */}
      {showCreateModal && (

        <PurchaseModal
          title="Create Purchase"
          formData={formData}
          handleChange={handleChange}
          supplierList={supplierList}
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreatePurchase}
        />
      )}

      {/* EDIT */}
      {showEditModal && (

        <PurchaseModal
          title="Edit Purchase"
          formData={formData}
          handleChange={handleChange}
          supplierList={supplierList}
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdatePurchase}
        />
      )}
    </div>
  );
}


// ==========================================
// PURCHASE MODAL
// ==========================================
function PurchaseModal({
  title,
  formData,
  handleChange,
  supplierList,
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

              <div className="mb-3">

                <label className="form-label">
                  Supplier
                </label>

                <select
                  className="form-select"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Supplier
                  </option>

                  {supplierList.map((supplier) => (

                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>
                  ))}

                </select>

              </div>

              <InputField
                label="Invoice Number"
                name="invoice_number"
                value={formData.invoice_number}
                handleChange={handleChange}
              />

              <InputField
                label="Total Amount"
                name="total_amount"
                value={formData.total_amount}
                handleChange={handleChange}
                type="number"
              />

              <InputField
                label="Purchase Date"
                name="purchase_date"
                value={formData.purchase_date}
                handleChange={handleChange}
                type="date"
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


// ==========================================
// INPUT FIELD
// ==========================================
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