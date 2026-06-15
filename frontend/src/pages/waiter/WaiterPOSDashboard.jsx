import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { getPOSProducts } from "../../services/posService";
import {
  getTableList,
  getFloorList,
  getAreaList,
} from "../../services/dashboardService";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { createOrder } from "../../services/orderService";

// ==========================================
// POS DASHBOARD
// ==========================================
export default function WaiterPOSDashboard() {
  // ==========================================
  // USER
  // ==========================================
  const user = useSelector((state) => state.auth.user);

  // ==========================================
  // RESTAURANT ID
  // ==========================================
  const restaurantId = user?.restaurant_id;

  // ==========================================
  // PRODUCT LIST
  // ==========================================
  const [productList, setProductList] = useState([]);

  // ==========================================
  // CATEGORY LIST
  // ==========================================
  const [categoryList, setCategoryList] = useState([]);

  // ==========================================
  // CART ITEMS
  // ==========================================
  const [cartItems, setCartItems] = useState([]);

  // ==========================================
  // SEARCH
  // ==========================================
  const [search, setSearch] = useState("");

  // ==========================================
  // SELECTED CATEGORY
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ==========================================
  // LOADING
  // ==========================================
  const [loading, setLoading] = useState(false);

  // ==========================================
  // ALERT
  // ==========================================
  const [alert, setAlert] = useState(null);

  // ==========================================
  // SHOW CART
  // ==========================================
  const [showCart, setShowCart] = useState(false);

  // ==========================================
  // ORDER TYPE
  // ==========================================
  const [orderType, setOrderType] = useState("dine_in");

  // ==========================================
  // ORDER NOTES
  // ==========================================
  const [orderNotes, setOrderNotes] = useState("");

  // ==========================================
  // SELECTED TABLE
  // ==========================================
  const [selectedTable, setSelectedTable] = useState("");

  // ==========================================
  // FLOOR LIST
  // ==========================================
  const [floorList, setFloorList] = useState([]);

  // ==========================================
  // AREA LIST
  // ==========================================
  const [areaList, setAreaList] = useState([]);

  // ==========================================
  // AVAILABLE TABLES
  // ==========================================
  const [tableList, setTableList] = useState([]);

  // ==========================================
  // PAYMENT METHOD
  // ==========================================
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // ==========================================
  // SHOW TABLE MODAL
  // ==========================================
  const [showTableModal, setShowTableModal] = useState(false);

  // ==========================================
  // FLOOR FILTER
  // ==========================================
  const [selectedFloor, setSelectedFloor] = useState(null);

  // ==========================================
  // AREA FILTER
  // ==========================================
  const [selectedArea, setSelectedArea] = useState(null);

  const [allServiceCharges, setAllServiceCharges] = useState([]);

  const [showBreakdown, setShowBreakdown] = useState(false);

  // ==========================================
  // FILTER SERVICE CHARGES BY ORDER TYPE
  // ==========================================
  const serviceCharges = allServiceCharges.filter((charge) => {
    const applicableTypes = charge.applicable_order_types || [];

    // APPLY TO ALL ORDER TYPES
    if (applicableTypes.length === 0) {
      return true;
    }

    // MATCH CURRENT ORDER TYPE
    return applicableTypes.includes(orderType);
  });

  // ==========================================
  // FETCH FLOORS
  // ==========================================
  const fetchFloors = async () => {
    try {
      const data = await getFloorList(restaurantId);

      if (Array.isArray(data)) {
        setFloorList(data);
      } else if (Array.isArray(data.results)) {
        setFloorList(data.results);
      } else {
        setFloorList([]);
      }
    } catch (error) {
      console.log(error);

      setFloorList([]);
    }
  };

  // ==========================================
  // FETCH AREAS
  // ==========================================
  const fetchAreas = async () => {
    try {
      const data = await getAreaList(restaurantId);

      if (Array.isArray(data)) {
        setAreaList(data);
      } else if (Array.isArray(data.results)) {
        setAreaList(data.results);
      } else {
        setAreaList([]);
      }
    } catch (error) {
      console.log(error);

      setAreaList([]);
    }
  };

  // ==========================================
  // FETCH TABLES
  // ==========================================
  const fetchTables = async () => {
    try {
      const data = await getTableList(restaurantId);

      console.log("TABLE API:", data);

      // ======================================
      // TABLES ARRAY
      // ======================================
      if (Array.isArray(data.tables)) {
        setTableList(data.tables);
      } else {
        setTableList([]);
      }
    } catch (error) {
      console.log(error);

      setTableList([]);
    }
  };

  // ==========================================
  // FETCH PRODUCTS AND TABLES
  // ==========================================
  useEffect(() => {
    if (restaurantId) {
      fetchProducts();

      fetchTables();

      fetchFloors();

      fetchAreas();
    }
  }, [restaurantId, selectedCategory, search]);

  useEffect(() => {
    if (selectedFloor) {
      const filteredAreas = areaList.filter(
        (area) => String(area.floor) === String(selectedFloor),
      );

      if (filteredAreas.length > 0) {
        setSelectedArea(filteredAreas[0].id);
      }
    }
  }, [selectedFloor, areaList]);

  // ==========================================
  // RESET DINE IN DATA
  // ==========================================
  useEffect(() => {
    if (orderType !== "dine_in") {
      setSelectedTable("");
    }
  }, [orderType]);

  const filteredTables = tableList.filter(
  (table) =>
    String(table.floor) === String(selectedFloor) &&
    (!selectedArea ||
      String(table.area) === String(selectedArea))
);
  // ==========================================
  // GET PRODUCTS
  // ==========================================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const data = await getPOSProducts(restaurantId, {
        category_id: selectedCategory,
        search: search,
      });

      console.log("POS PRODUCTS:", data);

      // ==========================================
      // HANDLE DIFFERENT RESPONSE TYPES
      // ==========================================
      let products = [];

      if (Array.isArray(data)) {
        products = data;
      } else {
        const productItems = Array.isArray(data.products) ? data.products : [];

        const comboItems = Array.isArray(data.combos) ? data.combos : [];

        // MERGE BOTH
        products = [...productItems, ...comboItems];
      }

      setProductList(products);
      // setServiceCharges(data.service_charges || []);
      setAllServiceCharges(data.service_charges || []);

      // ==========================================
      // CATEGORY LIST
      // ==========================================
      const uniqueCategories = [];

      products.forEach((item) => {
        if (item.type !== "product") {
          return;
        }

        const exists = uniqueCategories.find(
          (cat) => cat.id === item.category_id,
        );

        if (!exists) {
          uniqueCategories.push({
            id: item.category_id,
            name: item.category_name,
          });
        }
      });

      setCategoryList(uniqueCategories);
    } catch (error) {
      console.log(error);

      setProductList([]);

      setAlert({
        type: "danger",
        message: "Failed to fetch products.",
      });
    } finally {
      setLoading(false);
    }
  };
  // ==========================================
  // ADD TO CART
  // ==========================================
  const handleAddToCart = (item) => {
    const itemKey =
      item.type === "product"
        ? `product-${item.variant_id}`
        : `combo-${item.combo_id}`;

    const existingItem = cartItems.find(
      (cartItem) => cartItem.cart_key === itemKey,
    );

    // ==========================================
    // EXISTS
    // ==========================================
    if (existingItem) {
      const updatedCart = cartItems.map((cartItem) => {
        if (cartItem.cart_key === itemKey) {
          return {
            ...cartItem,
            quantity: cartItem.quantity + 1,
          };
        }

        return cartItem;
      });

      setCartItems(updatedCart);
    }

    // ==========================================
    // NEW ITEM
    // ==========================================
    else {
      setCartItems([
        ...cartItems,
        {
          ...item,

          cart_key: itemKey,

          quantity: 1,

          // IMPORTANT
          available_addons: item.addons || [],

          selected_addons: [],

          item_notes: "",
        },
      ]);
    }
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================
  const handleRemoveFromCart = (cartKey) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.cart_key === cartKey) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCartItems(updatedCart);
  };

  // ==========================================
  // UPDATE ITEM NOTES
  // ==========================================
  const handleItemNotesChange = (cartKey, value) => {
    const updatedCart = cartItems.map((item) => {
      if (item.cart_key === cartKey) {
        return {
          ...item,
          item_notes: value,
        };
      }

      return item;
    });

    setCartItems(updatedCart);
  };

  // ==========================================
  // TOGGLE ADDON
  // ==========================================
  const handleAddonToggle = (cartKey, addon) => {
    const updatedCart = cartItems.map((item) => {
      if (item.cart_key !== cartKey) {
        return item;
      }

      const existingAddon = item.selected_addons.find((a) => a.id === addon.id);

      // REMOVE
      if (existingAddon) {
        return {
          ...item,

          selected_addons: item.selected_addons.filter(
            (a) => a.id !== addon.id,
          ),
        };
      }

      // ADD WITH QUANTITY
      return {
        ...item,

        selected_addons: [
          ...item.selected_addons,

          {
            ...addon,
            quantity: 1,
          },
        ],
      };
    });

    setCartItems(updatedCart);
  };

  // ==========================================
  // INCREASE ADDON QTY
  // ==========================================
  const increaseAddonQuantity = (cartKey, addonId) => {
    const updatedCart = cartItems.map((item) => {
      if (item.cart_key !== cartKey) {
        return item;
      }

      return {
        ...item,

        selected_addons: item.selected_addons.map((addon) => {
          if (addon.id === addonId) {
            return {
              ...addon,
              quantity: addon.quantity + 1,
            };
          }

          return addon;
        }),
      };
    });

    setCartItems(updatedCart);
  };

  // ==========================================
  // DECREASE ADDON QTY
  // ==========================================
  const decreaseAddonQuantity = (cartKey, addonId) => {
    const updatedCart = cartItems.map((item) => {
      if (item.cart_key !== cartKey) {
        return item;
      }

      return {
        ...item,

        selected_addons: item.selected_addons
          .map((addon) => {
            if (addon.id === addonId) {
              return {
                ...addon,
                quantity: addon.quantity - 1,
              };
            }

            return addon;
          })
          .filter((addon) => addon.quantity > 0),
      };
    });

    setCartItems(updatedCart);
  };

  // ==========================================
  // SAVE ORDER
  // ==========================================
  const handleSaveOrder = async () => {
    try {
      if (cartItems.length === 0) {
        setAlert({
          type: "danger",
          message: "Cart is empty",
        });

        return;
      }

      if (orderType === "dine_in" && !selectedTable) {
        setAlert({
          type: "danger",
          message: "Please select table",
        });

        return;
      }

      const payload = {
        order_type: orderType,

        floor_id: selectedFloor,

        area_id: selectedArea,

        table_id: selectedTable,

        waiter_id: null,

        notes: orderNotes,

        payment_method: paymentMethod,

        // ==========================================
        // TOTALS
        // ==========================================
        subtotal: cartSubtotal,

        tax_total: totalTax,

        service_charge_total: totalServiceCharge,

        grand_total: totalPrice,

        // ==========================================
        // PAYMENT
        // ==========================================
        payment_status: "pending",

        order_status: "pending",

        // ==========================================
        // SERVICE CHARGES
        // ==========================================
        service_charges: serviceChargeBreakdown.map((charge) => ({
          name: charge.name,
          charge_type: charge.charge_type,
          value: charge.value,
          amount: charge.amount,
        })),

        // ==========================================
        // TAX BREAKDOWN
        // ==========================================
        taxes: taxBreakdown.map((tax) => ({
          name: tax.name,
          percentage: tax.percentage,
          amount: tax.amount,
        })),

        // ==========================================
        // ITEMS
        // ==========================================
        items: cartItems.map((item) => ({
          item_type: item.type,

          product_variant_id: item.type === "product" ? item.variant_id : null,

          combo_id: item.type === "combo" ? item.combo_id : null,

          item_name:
            item.type === "product" ? item.product_name : item.combo_name,

          original_price: item.original_price,

          final_price: item.final_price,

          dynamic_pricing_name: item.dynamic_pricing_name,

          quantity: item.quantity,

          notes: item.item_notes,

          // ==========================================
          // ITEM TOTAL
          // ==========================================
          total_price:
            (Number(item.final_price) +
              item.selected_addons.reduce(
                (sum, addon) => sum + Number(addon.price),
                0,
              )) *
            item.quantity,

          // ==========================================
          // ITEM TAXES
          // ==========================================
          taxes: item.taxes || [],

          // ==========================================
          // ADDONS
          // ==========================================
          addons: item.selected_addons.map((addon) => ({
            addon_id: addon.id,
            addon_name: addon.name,
            addon_price: addon.price,

            quantity: addon.quantity,
          })),
        })),
      };

      const data = await createOrder(restaurantId, payload);

      setAlert({
        type: "success",
        message: `Order ${data.order_number} saved successfully`,
      });

      // CLEAR
      setCartItems([]);

      setOrderNotes("");

      setSelectedTable("");
      setShowCart(false);

      fetchTables();
    } catch (error) {
      console.log(error);

      setAlert({
        type: "danger",
        message: "Failed to save order",
      });
    }
  };

  // ==========================================
  // TOTAL CART ITEMS
  // ==========================================
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartSubtotal = cartItems.reduce((total, item) => {
    const addonTotal = item.selected_addons.reduce((sum, addon) => {
      return sum + Number(addon.price) * Number(addon.quantity);
    }, 0);

    const itemBasePrice = Number(item.final_price) * item.quantity + addonTotal;

    return total + itemBasePrice;
  }, 0);

  // ==========================================
  // TAX BREAKDOWN
  // ==========================================
  const taxBreakdown = [];

  // ==========================================
  // ADD TAX HELPER
  // ==========================================
  const addTaxAmount = (taxName, percentage, amount) => {
    const existingTax = taxBreakdown.find(
      (t) => t.name === taxName && Number(t.percentage) === Number(percentage),
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

  // ==========================================
  // LOOP CART ITEMS
  // ==========================================
  cartItems.forEach((item) => {
    // ========================================
    // PRODUCT BASE TOTAL
    // ========================================
    const productBaseTotal = Number(item.final_price) * Number(item.quantity);

    // ========================================
    // PRODUCT TAXES
    // ========================================
    if (item.taxes && item.taxes.length > 0) {
      item.taxes.forEach((tax) => {
        const taxAmount = (productBaseTotal * Number(tax.percentage)) / 100;

        addTaxAmount(tax.name, tax.percentage, taxAmount);
      });
    }

    // ========================================
    // COMBO TAXES
    // ========================================
    if (item.type === "combo") {
      item.combo_items?.forEach((comboItem) => {
        // ==================================
        // IMPORTANT:
        // MULTIPLY BY CART QUANTITY
        // ==================================
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

    // ========================================
    // ADDON TAXES
    // ========================================
    item.selected_addons?.forEach((addon) => {
      const addonTotal = Number(addon.price) * Number(addon.quantity || 1);

      // IMPORTANT:
      // addon.taxes must come from backend

      if (addon.taxes && addon.taxes.length > 0) {
        addon.taxes.forEach((tax) => {
          const taxAmount = (addonTotal * Number(tax.percentage)) / 100;

          addTaxAmount(tax.name, tax.percentage, taxAmount);
        });
      }
    });
  });

  // ==========================================
  // TOTAL TAX
  // ==========================================
  const totalTax = taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);
  const serviceChargeBreakdown = [];

  serviceCharges.forEach((charge) => {
    let amount = 0;

    if (charge.charge_type === "percentage") {
      amount = (cartSubtotal * Number(charge.value)) / 100;
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

  const totalServiceCharge = serviceChargeBreakdown.reduce(
    (sum, charge) => sum + charge.amount,
    0,
  );

  const totalPrice = cartSubtotal + totalTax + totalServiceCharge;

  return (
    <div className="container-fluid">
      {/* ==========================================
          ALERT
      ========================================== */}
      {alert && (
        <div className={`alert alert-${alert.type} d-none d-md-block`}>
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
        <h2 className="fw-bold">POS Dashboard</h2>

        <button className="btn btn-dark" onClick={() => setShowCart(true)}>
          Cart ({totalCartItems})
        </button>
      </div>

      {/* ==========================================
          SEARCH BAR
      ========================================== */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="row">
        {/* ==========================================
            CATEGORY SIDEBAR
        ========================================== */}
        <div className="col-lg-2 mb-4">
          <div
            className="
              card
              border-0
              shadow-sm
            "
          >
            <div className="card-body">
              <h5 className="fw-bold mb-3">Categories</h5>

              {/* ALL CATEGORY */}
              <button
                className={`
                  btn
                  w-100
                  mb-2
                  ${selectedCategory === null ? "btn-primary" : "btn-light"}
                `}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>

              {/* CATEGORY LIST */}
              {categoryList.map((category) => (
                <button
                  key={`category-${category.id}`}
                  className={`
                    btn
                    w-100
                    mb-2
                    ${
                      selectedCategory === category.id
                        ? "btn-primary"
                        : "btn-light"
                    }
                  `}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==========================================
            PRODUCT GRID
        ========================================== */}
        <div className="col-lg-10">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="row g-4">
              {Array.isArray(productList) &&
                productList.map((product) => (
                  <div
                    key={`${product.type}-${product.variant_id || product.combo_id}`}
                    className="
                    col-12
                    col-sm-6
                    col-md-4
                    col-lg-3
                  "
                  >
                    <div
                      className="
                      card
                      border-0
                      shadow-sm
                      h-100
                      rounded-4
                      overflow-hidden
                    "
                    >
                      {/* ==========================================
                        IMAGE
                    ========================================== */}
                      <div
                        className="
                        position-relative
                        bg-light
                        d-flex
                        align-items-center
                        justify-content-center
                      "
                        style={{
                          height: "200px",
                          overflow: "hidden",
                        }}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={
                              product.type === "product"
                                ? product.product_name
                                : product.combo_name
                            }
                            className="w-100 h-100"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="
                            d-flex
                            flex-column
                            align-items-center
                            justify-content-center
                            h-100
                            text-muted
                          "
                          >
                            <i
                              className="bi bi-image"
                              style={{
                                fontSize: "40px",
                              }}
                            ></i>

                            <small>No Image</small>
                          </div>
                        )}

                        {/* VEG / NON VEG */}
                        {product.type === "product" && (
                          <span
                            className={`
                            badge
                            position-absolute
                            top-0
                            end-0
                            m-2
                            ${product.is_veg ? "bg-success" : "bg-danger"}
                          `}
                          >
                            {product.is_veg ? "Veg" : "Non Veg"}
                          </span>
                        )}

                        {/* COMBO BADGE */}
                        {product.type === "combo" && (
                          <span
                            className="
                            badge
                            bg-warning
                            position-absolute
                            top-0
                            end-0
                            m-2
                          "
                          >
                            Combo
                          </span>
                        )}
                      </div>

                      {/* ==========================================
                        CARD BODY
                    ========================================== */}
                      <div
                        className="
                        card-body
                        d-flex
                        flex-column
                      "
                      >
                        {/* CATEGORY */}
                        {product.type === "product" && (
                          <small
                            className="
                            text-uppercase
                            text-muted
                            fw-semibold
                            mb-1
                          "
                          >
                            {product.category_name}
                          </small>
                        )}

                        {/* ==========================================
    PRODUCT / COMBO TITLE
========================================== */}
                        <h6
                          className="
    fw-semibold
    text-dark
    mb-1
  "
                        >
                          {product.type === "product"
                            ? product.product_name
                            : product.combo_name}
                        </h6>

                        {/* ==========================================
    PRODUCT VARIANT
========================================== */}
                        {product.type === "product" && (
                          <small
                            className="
      text-muted
      mb-3
    "
                          >
                            {product.variant_name}
                          </small>
                        )}

                        {/* ==========================================
    COMBO ITEMS
========================================== */}
                        {product.type === "combo" &&
                          product.combo_items &&
                          product.combo_items.length > 0 && (
                            <div className="mb-3">
                              {product.combo_items.map((item, index) => (
                                <div
                                  key={index}
                                  className="
              d-flex
              justify-content-between
              align-items-center
              small
              text-muted
              mb-1
            "
                                >
                                  <span>{item.product_name}</span>

                                  <span>
                                    {item.variant_name} × {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* PRICE */}
                        <div className="mt-auto">
                          <div
                            className="
                            d-flex
                            justify-content-between
                            align-items-center
                            mb-3
                          "
                          >
                            <div>
                              {product.is_dynamic_pricing_applied && (
                                <small
                                  className="
        text-decoration-line-through
        text-muted
        d-block
      "
                                >
                                  ₹{product.original_price}
                                </small>
                              )}

                              <h5
                                className="
      fw-bold
      mb-0
      "
                                style={{ color: "#FF474C" }}
                              >
                                ₹{product.final_price}
                              </h5>

                              {product.is_dynamic_pricing_applied && (
                                <small className="text-success">
                                  {product.dynamic_pricing_name}
                                </small>
                              )}
                            </div>
                          </div>

                          {/* ADD BUTTON */}
                          <button
                            className="
                            btn
                            btn-primary
                            w-100
                            rounded-pill
                            fw-semibold
                          "
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
    CART MODAL
========================================== */}
      {showCart && (
        <div className="pos-cart">
          {/* HEADER */}
          <div
            className="
        d-flex
        justify-content-between
        align-items-center
        mb-4
      "
          >
            <h4 className="fw-bold mb-0">Cart</h4>

            <button
              className="btn-close"
              onClick={() => setShowCart(false)}
            ></button>
          </div>
          {alert && (
            <div className={`alert alert-${alert.type} mb-3 d-block d-md-none`}>
              {alert.message}
            </div>
          )}
          {/* EMPTY CART */}
          {cartItems.length === 0 && (
            <div className="text-center text-muted">Cart is empty</div>
          )}

          {/* CART ITEMS */}
          {cartItems.map((item) => (
            <div
              key={item.cart_key}
              className="
          border
          rounded-4
          p-3
          mb-3
        "
            >
              <div
                className="
            d-flex
            justify-content-between
            align-items-start
          "
              >
                <div>
                  <h6 className="fw-semibold mb-1">
                    {item.type === "product"
                      ? item.product_name
                      : item.combo_name}
                  </h6>

                  {/* PRODUCT VARIANT */}
                  {item.type === "product" && (
                    <small className="text-muted">{item.variant_name}</small>
                  )}

                  {/* COMBO ITEMS */}
                  {item.type === "combo" && item.combo_items && (
                    <div className="mt-2">
                      {item.combo_items.map((comboItem, index) => (
                        <div
                          key={index}
                          className="
                          small
                          text-muted
                        "
                        >
                          • {comboItem.product_name} ({comboItem.variant_name})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ==========================================
    ADDONS
========================================== */}
                  {item.available_addons &&
                    item.available_addons.length > 0 && (
                      <div className="mt-3">
                        <small
                          className="
          fw-semibold
          d-block
          mb-2
        "
                        >
                          Addons
                        </small>

                        {item.available_addons.map((addon) => {
                          const isSelected = item.selected_addons.some(
                            (a) => a.id === addon.id,
                          );

                          return (
                            <div
                              key={addon.id}
                              className="
                d-flex
                justify-content-between
                align-items-center
                border
                rounded
                p-2
                mb-2
              "
                            >
                              <div>
                                <div className="fw-semibold">{addon.name}</div>

                                <small className="text-muted">
                                  ₹{addon.price}
                                </small>
                              </div>

                              {isSelected ? (
                                <div
                                  className="
      d-flex
      align-items-center
      gap-2
    "
                                >
                                  <button
                                    type="button"
                                    className="
        btn
        btn-sm
        btn-outline-danger
      "
                                    onClick={() =>
                                      decreaseAddonQuantity(
                                        item.cart_key,
                                        addon.id,
                                      )
                                    }
                                  >
                                    -
                                  </button>

                                  <span>
                                    {
                                      item.selected_addons.find(
                                        (a) => a.id === addon.id,
                                      )?.quantity
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    className="
        btn
        btn-sm
        btn-outline-primary
      "
                                    onClick={() =>
                                      increaseAddonQuantity(
                                        item.cart_key,
                                        addon.id,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="
      btn
      btn-sm
      btn-primary
    "
                                  onClick={() =>
                                    handleAddonToggle(item.cart_key, addon)
                                  }
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>

                <h6 className="fw-bold">
                  ₹
                  {(
                    Number(item.final_price) * item.quantity +
                    item.selected_addons.reduce((sum, addon) => {
                      return sum + Number(addon.price) * Number(addon.quantity);
                    }, 0)
                  ).toFixed(2)}
                </h6>
              </div>

              {/* QUANTITY */}
              <div
                className="
            d-flex
            align-items-center
            gap-2
            mt-3
          "
              >
                <button
                  className="
              btn
              btn-sm
              btn-outline-danger
            "
                  onClick={() => handleRemoveFromCart(item.cart_key)}
                >
                  -
                </button>

                <span className="fw-semibold">{item.quantity}</span>

                <button
                  className="
              btn
              btn-sm
              btn-outline-primary
            "
                  onClick={() => handleAddToCart(item)}
                >
                  +
                </button>
              </div>

              {/* ==========================================
    ITEM NOTES
========================================== */}
              <div className="mt-3">
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Add notes..."
                  value={item.item_notes}
                  onChange={(e) =>
                    handleItemNotesChange(item.cart_key, e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          {/* ==========================================
    ORDER TYPE
========================================== */}
          <div className="mt-4">
            <label className="fw-semibold mb-2">Order Type</label>

            <select
              className="form-select"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="dine_in">Dine In</option>
            </select>
          </div>

          {/* ==========================================
    TABLE SELECTION BUTTON
========================================== */}
          {orderType === "dine_in" && (
            <div className="mt-4">
              <button
                className="
        btn
        btn-dark
        w-100
        rounded-pill
      "
                onClick={() => {
                  setShowTableModal(true);

                  if (floorList.length > 0 && !selectedFloor) {
                    setSelectedFloor(floorList[0].id);
                  }
                }}
              >
                {selectedTable ? `Table Selected` : "Select Table"}
              </button>
            </div>
          )}

          {/* ==========================================
    ORDER NOTES
========================================== */}
          <div className="mt-3">
            <label className="fw-semibold mb-2">Order Notes</label>

            <textarea
              className="form-control"
              rows={3}
              placeholder="Overall order notes..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          {/* ==========================================
    PAYMENT METHOD
========================================== */}
          <div className="mt-3">
            <label className="fw-semibold mb-2">Payment Method</label>

            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>

              <option value="upi">UPI</option>

              <option value="card">Card</option>

              <option value="wallet">Wallet</option>
            </select>
          </div>
          {/* FOOTER */}
          {/* ==========================================
    BILL SUMMARY
========================================== */}
          <div
            className="
    border
    rounded-4
    p-3
    mb-4
    bg-light
    mt-4
  "
          >
            {/* ==========================================
      TOTAL HEADER
  ========================================== */}
            <div
              className="
      d-flex
      justify-content-between
      align-items-center
      fw-bold
      fs-5
      mb-2
    "
            >
              {/* LEFT */}
              <button
                type="button"
                className="
        btn
        btn-link
        p-0
        text-decoration-none
        text-dark
        d-flex
        align-items-center
        gap-2
      "
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                {showBreakdown ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}

                <span className="fw-bold">Total</span>
              </button>

              {/* RIGHT */}
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            {/* ==========================================
      BREAKDOWN
  ========================================== */}
            {showBreakdown && (
              <div className="border-top pt-3 mt-3">
                {/* ==========================================
          SUBTOTAL
      ========================================== */}
                <div
                  className="
          d-flex
          justify-content-between
          mb-2
        "
                >
                  <span>Subtotal</span>

                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>

                {/* ==========================================
          TAXES
      ========================================== */}
                {taxBreakdown.length > 0 && (
                  <div className="mb-3">
                    <div
                      className="
              d-flex
              justify-content-between
              fw-semibold
              mb-2
            "
                    >
                      <span>Taxes</span>

                      <span>₹{totalTax.toFixed(2)}</span>
                    </div>

                    {taxBreakdown.map((tax, index) => (
                      <div
                        key={index}
                        className="
                d-flex
                justify-content-between
                small
                text-muted
                mb-1
              "
                      >
                        <span>
                          {tax.name} ({tax.percentage}%)
                        </span>

                        <span>₹{tax.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ==========================================
          APPLIED SERVICE CHARGES
      ========================================== */}
                {serviceChargeBreakdown.length > 0 && (
                  <div className="mb-3">
                    <div
                      className="
              d-flex
              justify-content-between
              fw-semibold
              mb-2
            "
                    >
                      <span>Charges</span>

                      <span>₹{totalServiceCharge.toFixed(2)}</span>
                    </div>

                    {serviceChargeBreakdown.map((charge, index) => (
                      <div
                        key={index}
                        className="
                d-flex
                justify-content-between
                small
                text-muted
                mb-1
              "
                      >
                        <span>
                          {charge.name}

                          {charge.charge_type === "percentage" &&
                            ` (${charge.value}%)`}
                        </span>

                        <span>₹{charge.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ==========================================
          FINAL TOTAL
      ========================================== */}
                <div
                  className="
          border-top
          pt-3
          mt-3
          d-flex
          justify-content-between
          fw-bold
        "
                >
                  <span>Grand Total</span>

                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================== ACTION BUTTONS ========================================== */}
          <div className="d-grid gap-2">
            {" "}
            <button
              className=" btn btn-outline-dark rounded-pill fw-semibold "
              onClick={handleSaveOrder}
            >
              {" "}
              Save Order{" "}
            </button>{" "}
          </div>
        </div>
      )}

      {/* ==========================================
    TABLE MODAL
========================================== */}
      {showTableModal && (
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
              overflow: "hidden",
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
                onClick={() => setShowTableModal(false)}
              />
            </div>

            <div className="row g-0 h-100">
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
                      const isAvailable = table.status === "available";

                      const isSelected =
                        String(selectedTable) === String(table.id);

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
                              setShowTableModal(false);
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
                            <h5 className="fw-bold">{table.table_number}</h5>

                            <small>Capacity: {table.capacity}</small>

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

                        <h5 className="mt-3 mb-2">No Tables Available</h5>

                        <p className="text-muted mb-0">
                          No tables have been created for the selected floor and
                          area.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
