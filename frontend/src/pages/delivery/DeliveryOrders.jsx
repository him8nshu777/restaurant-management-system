import { useEffect, useState, useRef } from "react";

import { useSelector } from "react-redux";

import { getOrderList, assignDeliveryOrder } from "../../services/orderService";

// ==========================================
// API / WS BASE URL
// ==========================================
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

// ==========================================
// DELIVERY ORDERS
// ==========================================
export default function DeliveryOrders() {
  // ========================================
  // REFS
  // ========================================
  const socketRef = useRef(null);

  const audioRef = useRef(null);

  // ========================================
  // ACTIVE RESTAURANT
  // ========================================
  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  const user = useSelector((state) => state.auth.user);

  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  // ========================================
  // STATES
  // ========================================
  const [orders, setOrders] = useState([]);

  const [isConnected, setIsConnected] = useState(false);

  const [liveNotification, setLiveNotification] = useState(null);
  const [, forceUpdate] = useState(0);
  // ========================================
  // UNLOCK AUDIO
  // BROWSER BLOCKS AUTOPLAY
  // ========================================
  useEffect(() => {
    const unlockAudio = async () => {
      try {
        if (!audioRef.current) {
          return;
        }

        audioRef.current.volume = 0;

        await audioRef.current.play();

        audioRef.current.pause();

        audioRef.current.currentTime = 0;

        audioRef.current.volume = 1;

        console.log("Audio unlocked");
      } catch (error) {
        console.log("Audio unlock failed:", error);
      }

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  // ========================================
  // FETCH ORDERS
  // ========================================
  const fetchOrders = async () => {
    try {
      const data = await getOrderList({ restaurantId, kitchen: false });

      const filteredOrders = data.filter(
        (order) => order.order_type === "delivery" && order.status === "ready" && order.delivery_status === "unassigned"
      );

      setOrders(filteredOrders);
    } catch (error) {
      console.log(error);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================
  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
    }
  }, [restaurantId]);

  // ========================================
  // PLAY SOUND
  // ========================================
  const playNotificationSound = () => {
    try {
      if (!audioRef.current) {
        console.log("Audio ref missing");

        return;
      }

      audioRef.current.pause();

      audioRef.current.currentTime = 0;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Sound played");
          })
          .catch((error) => {
            console.log("Audio play failed:", error);
          });
      }
    } catch (error) {
      console.log("Play sound error:", error);
    }
  };

  // ========================================
  // AUTO HIDE NOTIFICATION
  // ========================================
  useEffect(() => {
    if (!liveNotification) {
      return;
    }

    const timer = setTimeout(() => {
      setLiveNotification(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [liveNotification]);

  // ========================================
  // WEBSOCKET
  // ========================================
  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    // ======================================
    // CLOSE OLD SOCKET
    // ======================================
    if (socketRef.current) {
      socketRef.current.close();
    }

    // ======================================
    // SOCKET URL
    // ======================================
    const socketUrl = `${WS_BASE_URL}/ws/delivery/${restaurantId}/`;

    // ======================================
    // CREATE SOCKET
    // ======================================
    const socket = new WebSocket(socketUrl);

    socketRef.current = socket;

    // ======================================
    // OPEN
    // ======================================
    socket.onopen = () => {
      console.log("WebSocket Connected");

      setIsConnected(true);
    };

    // ======================================
    // MESSAGE
    // ======================================
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("WS EVENT:", data);

      // IMPORTANT
      // YOUR BACKEND SENDS:
      // { event: "new_order" }
      if (data.event === "delivery_request") {
        console.log("NEW ORDER RECEIVED");

        // PLAY SOUND
        playNotificationSound();

        // SHOW LIVE ALERT
        setLiveNotification({
          message: `New Order ${data.order.order_number}`,
        });
      }

      fetchOrders();
    };

    // ======================================
    // ERROR
    // ======================================
    socket.onerror = (error) => {
      console.log("Socket Error:", error);
    };

    // ======================================
    // CLOSE
    // ======================================
    socket.onclose = () => {
      console.log("WebSocket Disconnected");

      setIsConnected(false);
    };

    // ======================================
    // CLEANUP
    // ======================================
    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, [restaurantId]);

  // ========================================
  // AUTO REFRESH ORDER AGE
  // ========================================
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 30000); // every 30 sec

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // UPDATE STATUS
  // ========================================
  const updateStatus = async (orderId, status) => {
    // ======================================
    // INSTANT UI UPDATE
    // ======================================
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );

    try {
      await updateOrderStatus(orderId, {
        status,
      });
    } catch (error) {
      console.log(error);

      // OPTIONAL:
      // REFRESH IF FAILED
      fetchOrders();
    }
  };

  // ========================================
  // ACCEPT ORDER
  // ========================================
  const acceptOrder = async (orderId) => {
    try {

      await assignDeliveryOrder(
        orderId
      );

      fetchOrders();

    } catch (error) {

      console.log(error);

    }
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================
  const formatTime = (dateString) => {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMinutesAgo = (dateString) => {
    if (!dateString) return "-";

    const created = new Date(dateString);
    const now = new Date();

    const diffMinutes = Math.floor((now - created) / 1000 / 60);

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    return `${hours}h ${mins}m ago`;
  };

  const isNewOrder = (createdAt) => {
    const diff = (new Date() - new Date(createdAt)) / 1000 / 60;

    return diff <= 5;
  };

  return (
    <>
      {/* AUDIO */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/order-alert.mp3" type="audio/mpeg" />
      </audio>

      {/* LIVE NOTIFICATION */}
      {liveNotification && (
        <div
          className="
            position-fixed
            top-0
            end-0
            p-3
          "
          style={{
            zIndex: 9999,
          }}
        >
          <div
            className="
              alert
              alert-success
              shadow
              d-flex
              align-items-center
            "
          >
            <div className="me-2">🔔</div>

            <div>{liveNotification.message}</div>
          </div>
        </div>
      )}

      <div className="container-fluid py-3">
        {/* HEADER */}
        <div
          className="
            d-flex
            justify-content-between
            align-items-center
            mb-4
          "
        >
          <div>
            <h2 className="fw-bold mb-1">Delivery Display System</h2>

            <small className="text-muted">Live Delivery Orders</small>
          </div>

          {/* SOCKET STATUS */}
          <div>
            <span
              className={`
                badge
                ${isConnected ? "bg-success" : "bg-danger"}
              `}
            >
              {isConnected ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* EMPTY */}
        {orders.length === 0 && (
          <div
            className="
              card
              border-0
              shadow-sm
            "
          >
            <div
              className="
                card-body
                text-center
                py-5
              "
            >
              <h5>No Active Orders</h5>
            </div>
          </div>
        )}

        {/* ORDERS */}
        <div className="row">
          {orders.map((order) => (
            <div
              className="
                col-12
                col-md-6
                col-xl-4
                mb-4
              "
              key={order.id}
            >
              <div
                className="
                  card
                  shadow-sm
                  border-0
                  h-100
                "
              >
                <div className="card-body">
                  {/* TOP */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{order.order_number}</h5>

                      <div className="d-flex gap-2 flex-wrap">
                        {isNewOrder(order.kitchen_started_at) && (
                          <span className="badge bg-danger">NEW</span>
                        )}

                        <span className="badge bg-dark">
                          ⏱ {getMinutesAgo(order.kitchen_started_at)}
                        </span>

                        <span className="badge bg-success">
                          READY FOR DELIVERY
                        </span>
                      </div>
                    </div>

                    <div style={{ minWidth: "160px" }}>
                      {order.delivery_status === "unassigned" ? (
                        <button
                          className="btn btn-success w-100"
                          onClick={() => acceptOrder(order.id)}
                        >
                          Accept Delivery
                        </button>
                      ) : (
                        <span className="badge bg-primary">Assigned</span>
                      )}
                    </div>
                  </div>

                  {/* INFO */}
                  <div
                    className="
    border
    rounded
    p-3
    mb-3
    bg-light
  "
                  >
                    <div className="row g-2">
                      <div
                        className="
    border
    rounded
    p-3
    mb-3
    bg-light
  "
                      >
                        <div className="mb-2">
                          <small className="text-muted">Customer</small>

                          <div className="fw-semibold">
                            {order.customer_name || "-"}
                          </div>
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">Phone</small>

                          <div>{order.customer_phone || "-"}</div>
                        </div>

                        <div>
                          <small className="text-muted">Address</small>

                          <div>{order.delivery_address || "-"}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Total</small>
                        <div className="fw-semibold">
                          ₹{order.grand_total || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <small className="text-muted">Payment</small>

                      <div>{order.payment_method}</div>
                    </div>

                    <div className="col-6">
                      <small className="text-muted">Payment Status</small>

                      <div>{order.payment_status}</div>
                    </div>
                  </div>
                  {/* OVERALL ORDER NOTE */}
                  {order.notes && (
                    <div
                      className="
      alert
      alert-danger
      mb-3
      fw-bold
    "
                    >
                      🚨 {order.notes}
                    </div>
                  )}
                  <hr />

                  {/* ITEMS */}
                  <div>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="
                            border
                            rounded
                            p-3
                            mb-3
                            bg-light
                          "
                      >
                        <div
                          className="
                              d-flex
                              justify-content-between
                              align-items-center
                              mb-2
                            "
                        >
                          <div className="fw-bold fs-5 mb-2">
                            {item.quantity}x {item.item_name}
                            {item.combo_items?.length > 0 && (
                              <div
                                className="
      bg-light
      border
      rounded
      p-2
      mb-2
    "
                              >
                                {item.combo_items.map((combo) => (
                                  <div key={combo.id} className="small">
                                    • {combo.quantity * item.quantity}x{" "}
                                    {combo.product_name} ({combo.variant_name})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <span
                            className="
                                badge
                                bg-dark
                              "
                          >
                            ₹{item.total_price}
                          </span>
                        </div>

                        {/* ADDONS */}
                        {item.addons?.length > 0 && (
                          <div
                            className="
      bg-light
      border
      rounded
      p-2
      mt-2
    "
                          >
                            <div className="fw-bold mb-1">Addons</div>

                            {item.addons.map((addon) => (
                              <div key={addon.id} className="small">
                                • {addon.quantity}x {addon.addon_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
