import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { getCustomerOrderList } from "../../services/customerService";

import { updatePaymentStatus } from "../../services/orderService";
// ==========================================
// ORDER MANAGEMENT
// ==========================================
export default function ActiveOrders() {
  const user = useSelector((state) => state.auth.user);

  console.log("USER:", user);

  // ==========================================
  // ORDER LIST
  // ==========================================
  const [orderList, setOrderList] = useState([]);

  // ==========================================
  // ALERT
  // ==========================================
  const [alert, setAlert] = useState(null);

  // ==========================================
  // EDIT MODAL
  // ==========================================
  const [showEditModal, setShowEditModal] = useState(false);

  // ==========================================
  // SELECTED ORDER
  // ==========================================
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentOrder, setPaymentOrder] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  // ==========================================
  // FORM DATA
  // ==========================================
  const [formData, setFormData] = useState({
    status: "",
    payment_status: "",
    notes: "",
    items: [],
    delivery_status: "",
  });

  // ==========================================
  // FETCH ORDERS
  // ==========================================
  const fetchOrders = async () => {
    try {
      const data = await getCustomerOrderList({ order_history: false });
      setOrderList(data);
    } catch (error) {
      console.log(error);

      setAlert({
        type: "danger",
        message: "Failed to fetch orders.",
      });
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (order) => {
    setSelectedOrder(order);

    setFormData({
      status: order.status,
      delivery_status: order.delivery_status,
      payment_status: order.payment_status,

      payment_method: order.payment_method || "",

      notes: order.notes || "",

      tax_amount: order.tax_amount || 0,

      service_charge_amount: order.service_charge_amount || 0,

      subtotal: order.subtotal || 0,

      grand_total: order.grand_total || 0,

      taxes: order.taxes || [],

      service_charges: order.service_charges || [],

      items:
        order.items?.map((item) => ({
          id: item.id,

          item_name: item.item_name,

          item_type: item.item_type,

          product_variant_id: item.product_variant_id || null,

          combo_id: item.combo_id || null,

          quantity: item.quantity,

          final_price: item.final_price,

          original_price: item.original_price,

          total_price: item.total_price,

          notes: item.notes || "",

          dynamic_pricing_name: item.dynamic_pricing_name,

          // ======================================
          // IMPORTANT
          // ======================================
          taxes: item.taxes || [],

          combo_items: item.combo_items || [],

          addons:
            item.addons?.map((addon) => ({
              id: addon.id,

              addon_id: addon.addon_id,

              addon_name: addon.addon_name,

              addon_price: addon.addon_price,

              quantity: addon.quantity,

              total_price: addon.total_price,

              // ==================================
              // IMPORTANT
              // ==================================
              taxes: addon.taxes || [],
            })) || [],
        })) || [],
    });

    setShowEditModal(true);
  };

  // ==========================================
  // OPEN PAYMENT MODAL
  // ==========================================
  const openPaymentModal = (order) => {
    setPaymentOrder(order);

    setSelectedPaymentMethod(order.payment_method || "cash");

    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    try {
      await updatePaymentStatus(paymentOrder.id, "paid", selectedPaymentMethod);

      await fetchOrders();

      setShowPaymentModal(false);

      setAlert({
        type: "success",
        message: "Payment collected successfully",
      });
    } catch (error) {
      console.log(error);

      setAlert({
        type: "danger",
        message: "Failed to collect payment",
      });
    }
  };

  return (
    <div className="container-fluid">
      {/* ALERT */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      {/* HEADER */}
      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >
        <h2 className="fw-bold">Orders</h2>
      </div>

      {/* TABLE */}
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
                  <th>Restaurant Name</th>
                  <th>Total</th>
                  <th>Delivery Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orderList.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.restaurant_name}</td>
                    <td>₹{order.grand_total}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {order.delivery_status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`
                          badge
                          ${
                            order.payment_status === "paid"
                              ? "bg-success"
                              : order.payment_status === "failed"
                                ? "bg-danger"
                                : "bg-warning"
                          }
                        `}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      {order.payment_status !== "paid" && (
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => openPaymentModal(order)}
                        >
                          Payment
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openEditModal(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalWrapper
          title="Order Details"
          onClose={() => setShowEditModal(false)}
           showFooter={false}
        >
          {/* STATUS */}
          <div className="mb-3">
            <label className="form-label">Delivery Status</label>

            <input
              className="form-select"
              name="delivery_status"
              value={formData.delivery_status}
              readOnly
            ></input>
          </div>
          {/* PAYMENT STATUS */}
          <div className="mb-3">
            <label className="form-label">Payment Status</label>

            <input
              className="form-select"
              name="payment_status"
              value={formData.payment_status}
              readOnly
            ></input>
          </div>

          {/* NOTES */}
          <div className="mb-3">
            <label className="form-label">Notes</label>

            <textarea
              className="form-control"
              rows={3}
              name="notes"
              value={formData.notes}
              readOnly
            />
          </div>

          {/* ITEMS */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Order Items</h5>

            {formData.items.map((item, index) => (
              <div
                key={item.id}
                className="
          card
          border-0
          shadow-sm
          mb-3
        "
              >
                <div className="card-body">
                  {/* HEADER */}
                  <div
                    className="
              d-flex
              justify-content-between
              align-items-start
              mb-3
            "
                  >
                    <div>
                      <h6 className="fw-bold mb-1">{item.item_name}</h6>

                      <small className="text-muted">
                        ₹{item.final_price} each
                      </small>

                      {item.dynamic_pricing_name && (
                        <div>
                          <span
                            className="
                      badge
                      bg-warning
                      text-dark
                      mt-1
                    "
                          >
                            {item.dynamic_pricing_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>

                    <div
                      className="
                d-flex
                align-items-center
              "
                    >
                      <input
                        type="number"
                        className="
                  form-control
                  mx-2
                  text-center
                "
                        style={{
                          width: "80px",
                        }}
                        value={item.quantity}
                      />
                    </div>
                  </div>

                  {/* NOTES */}
                  <div className="mb-3">
                    <label className="form-label">Item Notes</label>

                    <textarea
                      rows={2}
                      className="form-control"
                      value={item.notes || ""}
                      readOnly
                    />
                  </div>

                  {/* ADDONS */}
                  {item.addons?.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold">Addons</h6>

                      {item.addons.map((addon, addonIndex) => (
                        <div
                          key={addon.id}
                          className="
                      border
                      rounded
                      p-2
                      mb-2
                    "
                        >
                          <div
                            className="
                        d-flex
                        justify-content-between
                        align-items-center
                      "
                          >
                            <div>
                              <div>{addon.addon_name}</div>

                              <small
                                className="
                            text-muted
                          "
                              >
                                ₹{addon.addon_price}
                              </small>
                            </div>
                          </div>

                          <div
                            className="
                        d-flex
                        align-items-center
                        mt-2
                      "
                          >
                            <input
                              type="number"
                              min="1"
                              className="
                          form-control
                        "
                              readOnly
                              style={{
                                width: "90px",
                              }}
                              value={addon.quantity}
                            />

                            <span className="ms-3">
                              Total: ₹{addon.total_price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TOTAL */}
                  <div
                    className="
              bg-light
              rounded
              p-2
            "
                  >
                    <strong>Total Price:</strong>₹{item.total_price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TAXES */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Taxes</h5>

            {selectedOrder.tax_breakdown?.map((tax, index) => (
              <div
                key={`${tax.name}-${index}`}
                className="
        d-flex
        justify-content-between
        border-bottom
        py-2
      "
              >
                <span>
                  {tax.name} ({tax.percentage}%)
                </span>

                <span>₹{Number(tax.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* SERVICE CHARGES */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Service Charges</h5>

            {selectedOrder?.service_charge_breakdown?.map((charge, index) => (
              <div
                key={`${charge.name}-${index}`}
                className="
          d-flex
          justify-content-between
          border-bottom
          py-2
        "
              >
                <span>{charge.name}</span>

                <span>₹{Number(charge.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* BILL SUMMARY */}
          <div
            className="
    bg-light
    rounded
    p-3
    mb-3
  "
          >
            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Subtotal</span>

              <span>₹{selectedOrder.subtotal}</span>
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Tax</span>

              <span>₹{selectedOrder.tax_amount}</span>
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Service Charge</span>

              <span>₹{selectedOrder.service_charge_amount}</span>
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Discount</span>
              {formData.discount_amount ? (
                <span>₹{formData.discount_amount}</span>
              ) : null}
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              {/* <span>Round Off</span>

    <span>
      ₹
      {
        formData.round_off_amount
      }
    </span> */}
            </div>

            <hr />

            <div
              className="
      d-flex
      justify-content-between
      fw-bold
      fs-5
    "
            >
              <span>Grand Total</span>

              <span>₹{selectedOrder.grand_total}</span>
            </div>
          </div>

          {/* GRAND TOTAL */}
          <div
            className="
              bg-light
              p-3
              rounded
            "
          >
            <h5 className="mb-0">Grand Total: ₹{selectedOrder.grand_total}</h5>
          </div>
        </ModalWrapper>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <ModalWrapper
          title="Collect Payment"
          onClose={() => setShowPaymentModal(false)}
          onSubmit={(e) => {
            e.preventDefault();
            handlePayment();
          }}
          submitText="Make Payment"
        >
          <div className="mb-3">
            <label className="form-label">Payment Method</label>

            <select
              className="form-select"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>

              <option value="upi">UPI</option>

              <option value="card">Card</option>

              {/* <option value="wallet">
          Wallet
        </option> */}
            </select>
          </div>

          <div
            className="
        alert
        alert-info
      "
          >
            Amount:
            <strong>₹{paymentOrder?.grand_total}</strong>
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
  showFooter = true,
  submitText = "Save Changes",
}) {
  return (
    <div
      className="
        modal
        d-block
        fade
        show
      "
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="
    modal-dialog
    modal-xl
    modal-dialog-scrollable
  "
        style={{
          height: "95vh",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          className="modal-content"
          style={{
            maxHeight: "95vh",
          }}
        >
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* FORM */}
          <form
            onSubmit={onSubmit}
            className="
              d-flex
              flex-column
              h-100
            "
          >
            {/* BODY */}
            <div
              className="modal-body"
              style={{
                overflowY: "auto",
                maxHeight: "calc(95vh - 140px)",
              }}
            >
              {children}
            </div>

            {/* FOOTER */}
            {showFooter && (
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  {submitText}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
