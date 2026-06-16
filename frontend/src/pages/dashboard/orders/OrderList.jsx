import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getOrderList,
  updateOrder,
  deleteOrder,
  updatePaymentStatus,

  printOrderBill,
  transferTable,
} from "../../../services/orderService";

import {
  getTableList,
  getFloorList,
  getAreaList,
} from "../../../services/dashboardService";

// ==========================================
// ORDER MANAGEMENT
// ==========================================
export default function OrderList() {
  // ==========================================
  // ACTIVE RESTAURANT
  // ==========================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  const user = useSelector((state) => state.auth.user);

  // ==========================================
  // RESTAURANT ID
  // ==========================================
  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;
  console.log("USER:", user);

  console.log("USER RESTAURANT:", user?.restaurant);

  console.log("ACTIVE RESTAURANT:", activeRestaurant);

  console.log("RESTAURANT ID:", restaurantId);

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


  const [showTransferModal, setShowTransferModal] = useState(false);

const [transferOrder, setTransferOrder] = useState(null);

const [tableList, setTableList] = useState([]);

const [floorList, setFloorList] = useState([]);

const [areaList, setAreaList] = useState([]);

const [selectedFloor, setSelectedFloor] = useState(null);

const [selectedArea, setSelectedArea] = useState(null);

const [selectedTable, setSelectedTable] = useState(null);

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
  });

  // ==========================================
  // FETCH ORDERS
  // ==========================================
  const fetchOrders = async () => {
    try {
      const data = await getOrderList({ restaurantId, kitchen: false });
      setOrderList(data);
    } catch (error) {
      console.log(error);

      setAlert({
        type: "danger",
        message: "Failed to fetch orders.",
      });
    }
  };

 const fetchTransferData = async () => {
  try {
    const [
      tablesData,
      floorsData,
      areasData,
    ] = await Promise.all([
      getTableList(restaurantId),
      getFloorList(restaurantId),
      getAreaList(restaurantId),
    ]);

    setTableList(
      Array.isArray(tablesData?.tables)
        ? tablesData.tables
        : []
    );

    setFloorList(
      Array.isArray(floorsData)
        ? floorsData
        : floorsData?.results || []
    );

    setAreaList(
      Array.isArray(areasData)
        ? areasData
        : areasData?.results || []
    );

  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  if (restaurantId) {
    fetchOrders();

    fetchTransferData();
  }
}, [restaurantId]);

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

      payment_status: order.payment_status,

      payment_method: order.payment_method || "",

      notes: order.notes || "",

      discount_amount: order.discount_amount || 0,

      // round_off_amount:
      //   order.round_off_amount || 0,

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

  const openTransferModal = async (order) => {
    console.log("OPEN MODAL ORDER:", order);
  await fetchTransferData();

  setTransferOrder(order);

  setSelectedFloor(order.floor_id);

  setSelectedArea(order.area_id);

  setSelectedTable(order.table_id);

  setShowTransferModal(true);
};

  // ==========================================
  // OPEN PAYMENT MODAL
  // ==========================================
  const openPaymentModal = (order) => {
    setPaymentOrder(order);

    setSelectedPaymentMethod(order.payment_method || "cash");

    setShowPaymentModal(true);
  };

  const handleTransferTable = async () => {
    console.log("TRANSFER ORDER:", transferOrder);
  console.log("ORDER ID SENT:", transferOrder?.id);
  console.log("NEW TABLE:", selectedTable);
  try {
    await transferTable(
      transferOrder.id,
  selectedTable
    );

    await fetchOrders();

    setShowTransferModal(false);

    setAlert({
      type: "success",
      message:
        "Table transferred successfully",
    });
  } catch (error) {
    console.log(error);

    setAlert({
      type: "danger",
      message:
        error?.response?.data?.error ||
        "Failed to transfer table",
    });
  }
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

  // ==========================================
// PRINT BILL
// ==========================================
const handlePrintBill = async (orderId) => {
  try {
    const pdfBlob = await printOrderBill(orderId);

    const fileURL = window.URL.createObjectURL(pdfBlob);

    window.open(fileURL, "_blank");
  } catch (error) {
    console.log(error);

    setAlert({
      type: "danger",
      message: "Failed to generate bill.",
    });
  }
};

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // HANDLE ITEM CHANGE
  // ==========================================
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = field === "quantity" ? Number(value) : value;

    // ========================================
    // AUTO TOTAL
    // ========================================
    const item = updatedItems[index];

    const baseTotal = Number(item.final_price) * Number(item.quantity);

    let addonTotal = 0;

    item.addons?.forEach((addon) => {
      addonTotal += Number(addon.addon_price) * Number(addon.quantity);
    });

    item.total_price = (baseTotal + addonTotal).toFixed(2);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // ==========================================
  // HANDLE ADDON CHANGE
  // ==========================================
  const handleAddonQuantityChange = (itemIndex, addonIndex, value) => {
    const updatedItems = [...formData.items];

    const addon = updatedItems[itemIndex].addons[addonIndex];

    addon.quantity = Number(value);

    const item = updatedItems[itemIndex];

    const baseTotal = Number(item.final_price) * Number(item.quantity);

    let addonTotal = 0;

    item.addons?.forEach((a) => {
      addonTotal += Number(a.addon_price) * Number(a.quantity);
    });

    item.total_price = (baseTotal + addonTotal).toFixed(2);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // ==========================================
  // REMOVE ADDON
  // ==========================================
  const removeAddon = (itemIndex, addonIndex) => {
    const updatedItems = [...formData.items];

    updatedItems[itemIndex].addons = updatedItems[itemIndex].addons.filter(
      (_, i) => i !== addonIndex,
    );

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================
  const increaseQuantity = (index) => {
    const item = formData.items[index];

    handleItemChange(index, "quantity", item.quantity + 1);
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================
  const decreaseQuantity = (index) => {
    const item = formData.items[index];

    if (item.quantity <= 1) {
      return;
    }

    handleItemChange(index, "quantity", item.quantity - 1);
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================
  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // ==========================================
  // CALCULATE SINGLE ITEM TOTAL
  // ==========================================
  const calculateItemTotal = (item) => {
    const baseTotal = Number(item.final_price) * Number(item.quantity);

    let addonTotal = 0;

    item.addons?.forEach((addon) => {
      addonTotal += Number(addon.addon_price) * Number(addon.quantity);
    });

    return (baseTotal + addonTotal).toFixed(2);
  };

  // ==========================================
  // LIVE BILL SUMMARY
  // ==========================================
  const calculateLiveTotals = () => {
    // ========================================
    // SUBTOTAL
    // ========================================
    let subtotal = 0;

    // ========================================
    // TAX BREAKDOWN
    // ========================================
    const taxBreakdown = [];

    // ========================================
    // ADD TAX HELPER
    // ========================================
    const addTaxAmount = (taxName, percentage, amount) => {
      const existingTax = taxBreakdown.find(
        (t) =>
          t.name === taxName && Number(t.percentage) === Number(percentage),
      );

      if (existingTax) {
        existingTax.amount += amount;
      } else {
        taxBreakdown.push({
          name: taxName,
          percentage,
          amount,
        });
      }
    };

    // ========================================
    // LOOP ITEMS
    // ========================================
    formData.items.forEach((item) => {
      // ======================================
      // PRODUCT BASE TOTAL
      // ======================================
      const productBaseTotal = Number(item.final_price) * Number(item.quantity);

      // ======================================
      // SUBTOTAL
      // ======================================
      subtotal += productBaseTotal;

      // ======================================
      // PRODUCT TAXES
      // ======================================
      if (item.taxes && item.taxes.length > 0) {
        item.taxes.forEach((tax) => {
          const taxAmount = (productBaseTotal * Number(tax.percentage)) / 100;

          addTaxAmount(tax.name, tax.percentage, taxAmount);
        });
      }

      // ======================================
      // COMBO TAXES
      // ======================================
      if (item.item_type === "combo") {
        item.combo_items?.forEach((comboItem) => {
          const comboItemTotal =
            Number(comboItem.allocated_price) *
            Number(comboItem.quantity) *
            Number(item.quantity);

          comboItem.taxes?.forEach((tax) => {
            const taxAmount = (comboItemTotal * Number(tax.percentage)) / 100;

            addTaxAmount(tax.name, tax.percentage, taxAmount);
          });
        });
      }

      // ======================================
      // ADDONS
      // ======================================
      item.addons?.forEach((addon) => {
        const addonTotal =
          Number(addon.addon_price) * Number(addon.quantity || 1);

        // ====================================
        // SUBTOTAL
        // ====================================
        subtotal += addonTotal;

        // ====================================
        // ADDON TAXES
        // ONLY IF ADDON HAS TAXES
        // ====================================
        if (addon.taxes && addon.taxes.length > 0) {
          addon.taxes.forEach((tax) => {
            const taxAmount = (addonTotal * Number(tax.percentage)) / 100;

            addTaxAmount(tax.name, tax.percentage, taxAmount);
          });
        }
      });
    });

    // ========================================
    // TOTAL TAX
    // ========================================
    const taxTotal = taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);

    // ========================================
    // SERVICE CHARGES
    // ========================================
    const serviceChargeBreakdown = [];

    formData.service_charges?.forEach((charge) => {
      let amount = 0;

      if (charge.charge_type === "percentage") {
        amount = (subtotal * Number(charge.value)) / 100;
      } else {
        amount = Number(charge.value);
      }

      serviceChargeBreakdown.push({
        name: charge.name,

        charge_type: charge.charge_type,

        value: charge.value,

        amount,
      });
    });

    // ========================================
    // TOTAL SERVICE CHARGE
    // ========================================
    const serviceChargeTotal = serviceChargeBreakdown.reduce(
      (sum, charge) => sum + charge.amount,
      0,
    );

    // ========================================
    // DISCOUNT
    // ========================================
    const discountAmount = Number(formData.discount_amount || 0);

    // ========================================
    // ROUND OFF
    // ========================================
    const roundOffAmount = Number(formData.round_off_amount || 0);

    // ========================================
    // GRAND TOTAL
    // ========================================
    const grandTotal =
      subtotal +
      taxTotal +
      serviceChargeTotal -
      discountAmount +
      roundOffAmount;

    return {
      subtotal: subtotal.toFixed(2),

      tax_total: taxTotal.toFixed(2),

      service_charge_total: serviceChargeTotal.toFixed(2),

      grand_total: grandTotal.toFixed(2),

      tax_breakdown: taxBreakdown,

      service_charge_breakdown: serviceChargeBreakdown,
    };
  };

  // ==========================================
  // UPDATE ORDER
  // ==========================================
  const handleUpdateOrder = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        status: formData.status,

        payment_status: formData.payment_status,

        payment_method: formData.payment_method,

        notes: formData.notes,

        discount_amount: formData.discount_amount,

        round_off_amount: formData.round_off_amount,

        items: formData.items.map((item) => ({
          id: item.id,
          item_type: item.item_type,
          product_variant_id: item.product_variant_id,
          combo_id: item.combo_id,
          quantity: item.quantity,

          notes: item.notes,

          addons:
            item.addons?.map((addon) => ({
              id: addon.id,
              addon_id: addon.addon_id,
              quantity: addon.quantity,
              addon_price: addon.addon_price,
            })) || [],
        })),
      };

      await updateOrder(selectedOrder.id, payload);

      await fetchOrders();

      setShowEditModal(false);

      setAlert({
        type: "success",
        message: "Order updated successfully.",
      });
    } catch (error) {
      console.log(error);

      setAlert({
        type: "danger",
        message: "Failed to update order.",
      });
    }
  };
  // ==========================================
  // DELETE ORDER
  // ==========================================
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Delete this order?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteOrder(orderId);

      fetchOrders();

      setAlert({
        type: "success",
        message: "Order deleted successfully.",
      });
    } catch (error) {
      console.log(error);

      setAlert({
        type: "danger",
        message: "Failed to delete order.",
      });
    }
  };

  const liveTotals = calculateLiveTotals();

  const filteredTables = tableList.filter(
  (table) =>
    String(table.floor) ===
      String(selectedFloor) &&
    (
      !selectedArea ||
      String(table.area) ===
        String(selectedArea)
    )
);

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
                    <td>{order.order_number}</td>

                    <td>{order.order_type}</td>

                    <td>{order.table_name || "-"}</td>

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

                    <td>₹{order.grand_total}</td>

                    <td>{new Date(order.created_at).toLocaleString()}</td>

                    <td>
                      <div className="action-buttons">
                        {order.payment_status !== "paid" &&
                          order.order_type === "dine_in" && (
                            <button
                              className="btn btn-info btn-sm me-2"
                              onClick={() =>
                                openTransferModal(order)
                              }
                            >
                              Transfer
                            </button>
                        )}
                      {order.payment_status !== "paid" && (
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => openPaymentModal(order)}
                        >
                          Payment
                        </button>
                      )}
                      <button
                        className="
                          btn
                          btn-warning
                          btn-sm
                          me-2
                        "
                        onClick={() => openEditModal(order)}
                      >
                        Edit
                      </button>

                      <button
                        className="
                          btn
                          btn-danger
                          btn-sm
                        "
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
                      </div>
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
          onClose={() => setShowEditModal(false)}
          footerActions={
    selectedOrder?.payment_status === "paid" && (
      <button
        type="button"
        className="btn btn-success"
        onClick={() => handlePrintBill(selectedOrder.id)}
      >
        Print Bill
      </button>
    )
  }
          onSubmit={handleUpdateOrder}
        >
          {/* STATUS */}
          <div className="mb-3">
            <label className="form-label">Order Status</label>

            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="saved">Saved</option>
              <option value="pending_approval">Pending Approval</option>

              <option value="running">Running</option>

              <option value="confirmed">Confirmed</option>

              <option value="preparing">Preparing</option>

              <option value="ready">Ready</option>

              <option value="served">Served</option>

              <option value="completed">Completed</option>

              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* PAYMENT STATUS */}
          <div className="mb-3">
            <label className="form-label">Payment Status</label>

            <select
              className="form-select"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>

              <option value="partial">Partial</option>

              <option value="paid">Paid</option>

              <option value="failed">Failed</option>

              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* NOTES */}
          <div className="mb-3">
            <label className="form-label">Notes</label>

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

                    <button
                      type="button"
                      className="
                btn
                btn-sm
                btn-danger
              "
                      onClick={() => removeItem(index)}
                    >
                      Delete
                    </button>
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
                      <button
                        type="button"
                        className="
                  btn
                  btn-outline-secondary
                "
                        onClick={() => decreaseQuantity(index)}
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
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="
                  btn
                  btn-outline-secondary
                "
                        onClick={() => increaseQuantity(index)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* NOTES */}
                  <div className="mb-3">
                    <label className="form-label">Item Notes</label>

                    <textarea
                      rows={2}
                      className="form-control"
                      value={item.notes || ""}
                      onChange={(e) =>
                        handleItemChange(index, "notes", e.target.value)
                      }
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

                            <button
                              type="button"
                              className="
                          btn
                          btn-sm
                          btn-outline-danger
                        "
                              onClick={() => removeAddon(index, addonIndex)}
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
                              value={addon.quantity}
                              onChange={(e) =>
                                handleAddonQuantityChange(
                                  index,
                                  addonIndex,
                                  e.target.value,
                                )
                              }
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
                    <strong>Item Total:</strong> {/* {item.total_price} */}₹
                    {calculateItemTotal(item)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TAXES */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Taxes</h5>

            {liveTotals.tax_breakdown?.map((tax, index) => (
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

            {liveTotals.service_charge_breakdown?.map((charge, index) => (
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

              <span>₹{liveTotals.subtotal}</span>
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Tax</span>

              <span>₹{liveTotals.tax_total}</span>
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Service Charge</span>

              <span>₹{liveTotals.service_charge_total}</span>
            </div>

            <div
              className="
      d-flex
      justify-content-between
      mb-2
    "
            >
              <span>Discount</span>

              <span>- ₹{formData.discount_amount}</span>
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

              <span>₹{liveTotals.grand_total}</span>
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
            <h5 className="mb-0">Grand Total: ₹{liveTotals.grand_total}</h5>
          </div>
        </ModalWrapper>
      )}

      {/* ==========================================
    TABLE MODAL
========================================== */}

      {showTransferModal && (
        <div
          className="
      position-fixed
      top-0
      start-0
      w-100
      h-100
      bg-dark
      bg-opacity-50
      d-flex
      justify-content-center
      align-items-center
    "
          style={{
            zIndex: 10000,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg"
            style={{
              width: "95%",
              height: "90%",
              overflow: "auto",
            }}
          >
            {/* HEADER */}
            <div
              className="
          d-flex
          justify-content-between
          align-items-center
          p-3
          border-bottom
        "
            >
              <h4 className="fw-bold mb-0">Select Table</h4>

              <button
                className="btn-close"
                onClick={() => {
    setShowTransferModal(false);
    setTransferOrder(null);
  }}
              />
            </div>

            <div className="row g-0">
              {/* ==========================================
            FLOOR SIDEBAR
        ========================================== */}
              <div
                className="col-12 col-md-2 border-end p-3"
                style={{
                  overflowY: "auto",
                }}
              >
                <h6 className="fw-bold mb-3">Floors</h6>

                {[
                  ...new Map(
                    tableList.map((table) => [
                      table.floor,
                      {
                        id: table.floor,
                        name: table.floor_name,
                      },
                    ]),
                  ).values(),
                ].map((floor) => (
                  <button
                    key={floor.id}
                    className={`
                btn
                w-100
                mb-2
                ${selectedFloor === floor.id ? "btn-dark" : "btn-outline-dark"}
              `}
                    onClick={() => {
                      setSelectedFloor(floor.id);

                      setSelectedArea(null);
                    }}
                  >
                    {floor.name}
                  </button>
                ))}
              </div>

              {/* ==========================================
            AREA SIDEBAR
        ========================================== */}
              <div
                className="col-12 col-md-2 border-end p-3"
                style={{
                  overflowY: "auto",
                }}
              >
                <h6 className="fw-bold mb-3">Areas</h6>

                {areaList
                  .filter(
                    (area) => String(area.floor) === String(selectedFloor),
                  )
                  .map((area) => (
                    <button
                      key={area.id}
                      className={`
                btn
                w-100
                mb-2
                ${
                  selectedArea === area.id
                    ? "btn-primary"
                    : "btn-outline-primary"
                }
              `}
                      onClick={() => setSelectedArea(area.id)}
                    >
                      {area.name}
                    </button>
                  ))}
              </div>

                  {/* ==========================================
    TABLE GRID
========================================== */}
<div
  className="col-12 col-md-8 p-3 p-md-4"
  style={{
    overflowY: "auto",
  }}
>
  <div className="row g-3">
    {filteredTables.length > 0 ? (
      filteredTables.map((table) => {
        const isAvailable =
          table.status === "available";

        const isSelected =
          String(selectedTable) ===
          String(table.id);

        return (
          <div
            key={table.id}
            className="
              col-6
              col-sm-4
              col-md-3
            "
          >
            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                setSelectedTable(table.id);
              }}
              className={`
                btn
                w-100
                p-4
                rounded-4
                border
                ${
                  isSelected
                    ? "btn-success"
                    : table.status === "available"
                    ? "btn-outline-success"
                    : table.status === "occupied"
                    ? "btn-outline-danger"
                    : table.status === "reserved"
                    ? "btn-outline-warning"
                    : "btn-outline-secondary"
                }
              `}
            >
              <h5 className="fw-bold">
                {table.table_number}
              </h5>

              <small>
                Capacity: {table.capacity}
              </small>

              <div className="mt-2">
                <span
                  className={`
                    badge
                    ${
                      table.status === "available"
                        ? "bg-success"
                        : table.status === "occupied"
                        ? "bg-danger"
                        : table.status === "reserved"
                        ? "bg-warning"
                        : "bg-secondary"
                    }
                  `}
                >
                  {table.status}
                </span>
              </div>
            </button>
          </div>
        );
      })
    ) : (
      <div className="col-12">
        <div
          className="
            border
            rounded-4
            bg-light
            text-center
            py-5
            px-3
          "
        >
          <div
            style={{
              fontSize: "3rem",
            }}
          >
            🪑
          </div>

          <h5 className="mt-3 mb-2">
            No Tables Available
          </h5>

          <p className="text-muted mb-0">
            No tables have been created
            for the selected floor and area.
          </p>
        </div>
      </div>
    )}
  </div>
</div>
              

            </div>
            {/* FOOTER */}
<div
  className="
    border-top
    p-3
    d-flex
    justify-content-end
    gap-2
  "
>
  <button
    className="btn btn-secondary"
    onClick={() => {
      setShowTransferModal(false);
      setTransferOrder(null);
    }}
  >
    Cancel
  </button>

  <button
    className="btn btn-success"
    disabled={
      !selectedTable ||
      selectedTable === transferOrder?.table_id
    }
    onClick={handleTransferTable}
  >
    Transfer Table
  </button>
</div>
          </div>
        </div>
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
          submitText="Collect Payment"
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
function ModalWrapper({ title, children, onClose, onSubmit, showFooter = true,
  submitText = "Save Changes", footerActions, }) {
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
                {footerActions}
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

                {/* <Button
                  variant="primary"
                  onClick={() => printBill(order.id)}
                >
                  Print Bill
                </Button> */}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
