import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getOrderList,
  updateOrder,
  deleteOrder,
} from "../../../services/orderService";

// ==========================================
// ORDER MANAGEMENT
// ==========================================
export default function OrderList() {

  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
  const activeRestaurant = useSelector(
    (state) =>
      state.restaurant.activeRestaurant
  );

  // ==========================================
  // ORDER LIST
  // ==========================================
  const [orderList, setOrderList] =
    useState([]);

  // ==========================================
  // ALERT
  // ==========================================
  const [alert, setAlert] =
    useState(null);

  // ==========================================
  // EDIT MODAL
  // ==========================================
  const [showEditModal, setShowEditModal] =
    useState(false);

  // ==========================================
  // SELECTED ORDER
  // ==========================================
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // ==========================================
  // FORM DATA
  // ==========================================
  const [formData, setFormData] =
    useState({
      status: "",
      payment_status: "",
      notes: "",
    });

  // ==========================================
  // FETCH ORDERS
  // ==========================================
  const fetchOrders = async () => {

    try {

      const data =
        await getOrderList(
          activeRestaurant.id
        );

      setOrderList(data);

    }

    catch (error) {

      console.log(error);

      setAlert({
        type: "danger",
        message:
          "Failed to fetch orders.",
      });

    }

  };

  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchOrders();

    }

  }, [activeRestaurant]);

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (order) => {

    setSelectedOrder(order);

    setFormData({
      status: order.status,
      payment_status:
        order.payment_status,
      notes: order.notes || "",
    });

    setShowEditModal(true);

  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

  };

  // ==========================================
  // UPDATE ORDER
  // ==========================================
  const handleUpdateOrder = async (e) => {

    e.preventDefault();

    try {

      await updateOrder(
        selectedOrder.id,
        formData
      );

      fetchOrders();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message:
          "Order updated successfully.",
      });

    }

    catch (error) {

      console.log(error);

      setAlert({
        type: "danger",
        message:
          "Failed to update order.",
      });

    }

  };

  // ==========================================
  // DELETE ORDER
  // ==========================================
  const handleDeleteOrder = async (
    orderId
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this order?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteOrder(orderId);

      fetchOrders();

      setAlert({
        type: "success",
        message:
          "Order deleted successfully.",
      });

    }

    catch (error) {

      console.log(error);

      setAlert({
        type: "danger",
        message:
          "Failed to delete order.",
      });

    }

  };

  return (

    <div className="container-fluid">

      {/* ==========================================
          ALERT
      ========================================== */}
      {alert && (

        <div
          className={`alert alert-${alert.type}`}
        >
          {alert.message}
        </div>

      )}

      {/* ==========================================
          HEADER
      ========================================== */}
      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >

        <h2 className="fw-bold">
          Orders
        </h2>

      </div>

      {/* ==========================================
          TABLE
      ========================================== */}
      <div
        className="
          card
          border-0
          shadow-sm
        "
      >

        <div className="card-body">

          <div className="table-responsive">

            <table className="table align-middle">

              <thead>

                <tr>

                  <th>Order No</th>

                  <th>Type</th>

                  <th>Table</th>

                  <th>Status</th>

                  <th>Payment</th>

                  <th>Total</th>

                  <th>Date</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {orderList.map((order) => (

                  <tr key={order.id}>

                    <td>
                      {order.order_number}
                    </td>

                    <td>
                      {order.order_type}
                    </td>

                    <td>
                      {order.table_name || "-"}
                    </td>

                    <td>

                      <span
                        className={`
                          badge
                          ${
                            order.status === "saved"
                              ? "bg-secondary"
                              : order.status === "running"
                              ? "bg-primary"
                              : order.status === "completed"
                              ? "bg-success"
                              : order.status === "cancelled"
                              ? "bg-danger"
                              : "bg-warning"
                          }
                        `}
                      >
                        {order.status}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`
                          badge
                          ${
                            order.payment_status ===
                            "paid"
                              ? "bg-success"
                              : order.payment_status ===
                                "failed"
                              ? "bg-danger"
                              : "bg-warning"
                          }
                        `}
                      >
                        {order.payment_status}
                      </span>

                    </td>

                    <td>
                      ₹{order.grand_total}
                    </td>

                    <td>

                      {new Date(
                        order.created_at
                      ).toLocaleString()}

                    </td>

                    <td>

                      {/* EDIT */}
                      <button
                        className="
                          btn
                          btn-warning
                          btn-sm
                          me-2
                        "
                        onClick={() =>
                          openEditModal(order)
                        }
                      >
                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        className="
                          btn
                          btn-danger
                          btn-sm
                        "
                        onClick={() =>
                          handleDeleteOrder(
                            order.id
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

      </div>

      {/* ==========================================
          EDIT MODAL
      ========================================== */}
      {showEditModal && (

        <ModalWrapper
          title="Edit Order"
          onClose={() =>
            setShowEditModal(false)
          }
          onSubmit={handleUpdateOrder}
        >

          {/* STATUS */}
          <div className="mb-3">

            <label className="form-label">
              Order Status
            </label>

            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >

              <option value="saved">
                Saved
              </option>

              <option value="running">
                Running
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="preparing">
                Preparing
              </option>

              <option value="ready">
                Ready
              </option>

              <option value="served">
                Served
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>

            </select>

          </div>

          {/* PAYMENT STATUS */}
          <div className="mb-3">

            <label className="form-label">
              Payment Status
            </label>

            <select
              className="form-select"
              name="payment_status"
              value={
                formData.payment_status
              }
              onChange={handleChange}
            >

              <option value="pending">
                Pending
              </option>

              <option value="partial">
                Partial
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="refunded">
                Refunded
              </option>

            </select>

          </div>

          {/* NOTES */}
          <div className="mb-3">

            <label className="form-label">
              Notes
            </label>

            <textarea
              className="form-control"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />

          </div>

        </ModalWrapper>

      )}

    </div>

  );

}

// ==========================================
// REUSABLE MODAL
// ==========================================
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
                className="
                  btn
                  btn-secondary
                "
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  btn
                  btn-primary
                "
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