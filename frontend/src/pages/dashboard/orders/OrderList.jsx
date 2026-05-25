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
console.log("USER:", user);

console.log(
  "USER RESTAURANT:",
  user?.restaurant
);

console.log(
  "ACTIVE RESTAURANT:",
  activeRestaurant
);

console.log(
  "RESTAURANT ID:",
  restaurantId
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
      items: [],
    });

  // ==========================================
  // FETCH ORDERS
  // ==========================================
  const fetchOrders = async () => {

    try {
      const data =
        await getOrderList(
          restaurantId
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

    if (restaurantId) {

      fetchOrders();

    }

  }, [restaurantId]);

  // ==========================================
// OPEN EDIT MODAL
// ==========================================
const openEditModal = (order) => {

  setSelectedOrder(order);

  setFormData({

    status: order.status,

    payment_status:
      order.payment_status,

    payment_method:
      order.payment_method || "",

    notes: order.notes || "",

    discount_amount:
      order.discount_amount || 0,

    // round_off_amount:
    //   order.round_off_amount || 0,

    tax_amount:
      order.tax_amount || 0,

    service_charge_amount:
      order.service_charge_amount || 0,

    subtotal:
      order.subtotal || 0,

    grand_total:
      order.grand_total || 0,

    taxes:
      order.taxes || [],

    service_charges:
      order.service_charges || [],

    items:
      order.items?.map((item) => ({

        id: item.id,

        item_name: item.item_name,

        item_type: item.item_type,

        quantity: item.quantity,

        final_price: item.final_price,

        original_price:
          item.original_price,

        total_price:
          item.total_price,

        notes: item.notes || "",

        dynamic_pricing_name:
          item.dynamic_pricing_name,

        addons:
          item.addons?.map(
            (addon) => ({

              id: addon.id,

              addon_name:
                addon.addon_name,

              addon_price:
                addon.addon_price,

              quantity:
                addon.quantity,

              total_price:
                addon.total_price,

            })
          ) || [],

      })) || [],

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
// HANDLE ITEM CHANGE
// ==========================================
const handleItemChange = (
  index,
  field,
  value
) => {

  const updatedItems = [
    ...formData.items,
  ];

  updatedItems[index][field] =
    field === "quantity"
      ? Number(value)
      : value;

  // ========================================
  // AUTO TOTAL
  // ========================================
  updatedItems[index].total_price =
    (
      Number(
        updatedItems[index]
          .final_price
      ) *
      Number(
        updatedItems[index]
          .quantity
      )
    ).toFixed(2);

  setFormData({
    ...formData,
    items: updatedItems,
  });

};

// ==========================================
// HANDLE ADDON CHANGE
// ==========================================
const handleAddonQuantityChange = (
  itemIndex,
  addonIndex,
  value
) => {

  const updatedItems = [
    ...formData.items,
  ];

  const addon =
    updatedItems[itemIndex]
      .addons[addonIndex];

  addon.quantity = Number(value);

  addon.total_price =
    (
      Number(addon.addon_price) *
      Number(addon.quantity)
    ).toFixed(2);

  setFormData({
    ...formData,
    items: updatedItems,
  });

};

// ==========================================
// REMOVE ADDON
// ==========================================
const removeAddon = (
  itemIndex,
  addonIndex
) => {

  const updatedItems = [
    ...formData.items,
  ];

  updatedItems[itemIndex].addons =
    updatedItems[itemIndex]
      .addons.filter(
        (_, i) =>
          i !== addonIndex
      );

  setFormData({
    ...formData,
    items: updatedItems,
  });

};

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================
  const increaseQuantity = (
    index
  ) => {

    const item =
      formData.items[index];

    handleItemChange(
      index,
      "quantity",
      item.quantity + 1
    );

  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================
  const decreaseQuantity = (
    index
  ) => {

    const item =
      formData.items[index];

    if (item.quantity <= 1) {
      return;
    }

    handleItemChange(
      index,
      "quantity",
      item.quantity - 1
    );

  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================
  const removeItem = (
    index
  ) => {

    const updatedItems =
      formData.items.filter(
        (_, i) => i !== index
      );

    setFormData({
      ...formData,
      items: updatedItems,
    });

  };

  // ==========================================
// CALCULATE GRAND TOTAL
// ==========================================
const calculateGrandTotal =
  () => {

    let subtotal = 0;

    formData.items.forEach(
      (item) => {

        subtotal += Number(
          item.total_price
        );

        item.addons?.forEach(
          (addon) => {

            subtotal += Number(
              addon.total_price
            );

          }
        );

      }
    );

    return (
      subtotal
      - Number(
          formData.discount_amount || 0
        )
      + Number(
          formData.tax_amount || 0
        )
      + Number(
          formData.service_charge_amount || 0
        )
      // + Number(
      //     formData.round_off_amount || 0
      //   )
    ).toFixed(2);

  };

  // ==========================================
  // UPDATE ORDER
  // ==========================================
  const handleUpdateOrder =
    async (e) => {

      e.preventDefault();

      try {

        await updateOrder(
          selectedOrder.id,
          formData
        );

    
        await fetchOrders();
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
  const handleDeleteOrder =
    async (orderId) => {

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

      {/* ALERT */}
      {alert && (

        <div
          className={`alert alert-${alert.type}`}
        >
          {alert.message}
        </div>

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

        <h2 className="fw-bold">
          Orders
        </h2>

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

                  <th>Type</th>

                  <th>Table</th>
                  <th>Waiter</th>
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
                      {order.order_type === "dine_in"
                        ? order.waiter_name || "Not Assigned"
                        : "-"}
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
                        {
                          order.payment_status
                        }
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

      {/* EDIT MODAL */}
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

          {/* ITEMS */}
<div className="mb-4">

  <h5 className="fw-bold mb-3">
    Order Items
  </h5>

  {formData.items.map(
    (item, index) => (

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

              <h6 className="fw-bold mb-1">
                {item.item_name}
              </h6>

              <small className="text-muted">

                ₹{item.final_price}
                {" "}
                each

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

                    {
                      item.dynamic_pricing_name
                    }

                  </span>

                </div>

              )}

            </div>

            <button
              type="button"
              className="
                btn
                btn-sm
                btn-danger
              "
              onClick={() =>
                removeItem(index)
              }
            >
              Delete
            </button>

          </div>

          {/* QUANTITY */}
          <div className="mb-3">

            <label className="form-label">
              Quantity
            </label>

            <div
              className="
                d-flex
                align-items-center
              "
            >

              <button
                type="button"
                className="
                  btn
                  btn-outline-secondary
                "
                onClick={() =>
                  decreaseQuantity(
                    index
                  )
                }
              >
                -
              </button>

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
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "quantity",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="
                  btn
                  btn-outline-secondary
                "
                onClick={() =>
                  increaseQuantity(
                    index
                  )
                }
              >
                +
              </button>

            </div>

          </div>

          {/* NOTES */}
          <div className="mb-3">

            <label className="form-label">
              Item Notes
            </label>

            <textarea
              rows={2}
              className="form-control"
              value={item.notes || ""}
              onChange={(e) =>
                handleItemChange(
                  index,
                  "notes",
                  e.target.value
                )
              }
            />

          </div>

          {/* ADDONS */}
          {item.addons?.length > 0 && (

            <div className="mb-3">

              <h6 className="fw-bold">
                Addons
              </h6>

              {item.addons.map(
                (
                  addon,
                  addonIndex
                ) => (

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

                        <div>
                          {
                            addon.addon_name
                          }
                        </div>

                        <small
                          className="
                            text-muted
                          "
                        >
                          ₹
                          {
                            addon.addon_price
                          }
                        </small>

                      </div>

                      <button
                        type="button"
                        className="
                          btn
                          btn-sm
                          btn-outline-danger
                        "
                        onClick={() =>
                          removeAddon(
                            index,
                            addonIndex
                          )
                        }
                      >
                        Remove
                      </button>

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
                        style={{
                          width: "90px",
                        }}
                        value={
                          addon.quantity
                        }
                        onChange={(e) =>
                          handleAddonQuantityChange(
                            index,
                            addonIndex,
                            e.target.value
                          )
                        }
                      />

                      <span className="ms-3">

                        Total:
                        {" "}
                        ₹
                        {
                          addon.total_price
                        }

                      </span>

                    </div>

                  </div>

                )
              )}

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

            <strong>
              Item Total:
            </strong>

            {" "}
            ₹
            {item.total_price}

          </div>

        </div>

      </div>

    )
  )}

</div>

{/* TAXES */}
<div className="mb-4">

  <h5 className="fw-bold mb-3">
    Taxes
  </h5>

  {formData.taxes?.map((tax) => (

    <div
      key={tax.id}
      className="
        d-flex
        justify-content-between
        border-bottom
        py-2
      "
    >

      <span>
        {tax.name}
        {" "}
        ({tax.percentage}%)
      </span>

      <span>
        ₹{tax.amount}
      </span>

    </div>

  ))}

</div>

{/* SERVICE CHARGES */}
<div className="mb-4">

  <h5 className="fw-bold mb-3">
    Service Charges
  </h5>

  {formData.service_charges?.map(
    (charge) => (

      <div
        key={charge.id}
        className="
          d-flex
          justify-content-between
          border-bottom
          py-2
        "
      >

        <span>
          {charge.name}
        </span>

        <span>
          ₹{charge.amount}
        </span>

      </div>

    )
  )}

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

    <span>
      ₹{formData.subtotal}
    </span>
  </div>

  <div
    className="
      d-flex
      justify-content-between
      mb-2
    "
  >
    <span>Tax</span>

    <span>
      ₹{formData.tax_amount}
    </span>
  </div>

  <div
    className="
      d-flex
      justify-content-between
      mb-2
    "
  >
    <span>
      Service Charge
    </span>

    <span>
      ₹
      {
        formData.service_charge_amount
      }
    </span>
  </div>

  <div
    className="
      d-flex
      justify-content-between
      mb-2
    "
  >
    <span>Discount</span>

    <span>
      - ₹
      {
        formData.discount_amount
      }
    </span>
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

    <span>
      ₹
      {calculateGrandTotal()}
    </span>

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

            <h5 className="mb-0">

              Grand Total:
              {" "}
              ₹
              {calculateGrandTotal()}

            </h5>

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

    <div
      className="
        modal
        d-block
        fade
        show
      "
      style={{
        backgroundColor:
          "rgba(0,0,0,0.5)",
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

            <h5 className="modal-title">
              {title}
            </h5>

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
                Save Changes
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}