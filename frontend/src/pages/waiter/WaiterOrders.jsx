import { useEffect, useState, useRef } from "react";

import { useSelector } from "react-redux";

import {
  getOrderList,
  updateOrderStatus,
} from "../../services/orderService";

// ==========================================
// API / WS BASE URL
// ==========================================
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

// ==========================================
// KITCHEN ORDERS
// ==========================================
export default function WaiterOrders() {
  // ========================================
  // REFS
  // ========================================
  const socketRef = useRef(null);

  const audioRef = useRef(null);

  const user = useSelector((state) => state.auth.user);

  const restaurantId = user?.restaurant_id;

  // ========================================
  // STATES
  // ========================================
  const [orders, setOrders] = useState([]);

  const [isConnected, setIsConnected] = useState(false);

  const [liveNotification, setLiveNotification] = useState(null);

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
  console.log("-->",restaurantId)

      if (!restaurantId) return;

      const data = await getOrderList({restaurantId});

      const filteredOrders = data.filter(
        (order) =>
          order.waiter_id === user.id &&
          ["ready", "served"].includes(order.status),
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
  }, [user]);

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
  console.log("USER OBJECT:", user);
  console.log("USER ID:", user?.id);
  console.log("U:", user?.restaurant_id);

  // ========================================
  // WEBSOCKET
  // ========================================
  useEffect(() => {
    if (!user?.id || !restaurantId) return;

    // ======================================
    // CLOSE OLD SOCKET
    // ======================================
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socketUrl = `${WS_BASE_URL}/ws/waiter/${user.id}/`;
    console.log("WAITER WS URL:", socketUrl);
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

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("WS EVENT:", data);

      if (data.event === "order_ready") {
        playNotificationSound();

        setLiveNotification({
          message: `Order Ready ${data.order.order_number}`,
        });

        // 🔥 DIRECT STATE UPDATE (IMPORTANT)
        setOrders((prev) => {
          const exists = prev.find((o) => o.id === data.order.id);

          if (exists) return prev;

          return [...prev, data.order];
        });
      }

      if (data.event === "order_updated") {
        fetchOrders();
      }
    };
    socket.onerror = (err) => {
      console.log("WS Error:", err);
    };

    socket.onclose = (e) => {
      console.log("WebSocket Disconnected", e.code, e.reason, e.wasClean);
      setIsConnected(false);
    };

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, [user?.id]);

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
  // STATUS BADGE
  // ========================================
  const getStatusBadge = (status) => {
    switch (status) {
      case "saved":
        return "bg-secondary";

      case "running":
        return "bg-primary";

      case "confirmed":
        return "bg-info";

      case "preparing":
        return "bg-warning";

      case "ready":
        return "bg-success";

      default:
        return "bg-dark";
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
            <h2 className="fw-bold mb-1">Waiter Orders</h2>

            <small className="text-muted">Live Waiter Orders</small>
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
                  <div
                    className="
                      d-flex
                      justify-content-between
                      align-items-start
                      mb-3
                    "
                  >
                    <div>
                      <h5 className="fw-bold mb-1">{order.order_number}</h5>
                      <div className="d-flex gap-2 flex-wrap">
                        <span
                          className={`badge ${getStatusBadge(order.status)}`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ minWidth: "160px" }}>
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="saved">Saved</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="served">Served</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* INFO */}
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
                      <div className="col-6">
                        <small className="text-muted">Order Type</small>

                        <div className="fw-semibold text-capitalize">
                          {order.order_type || "-"}
                        </div>
                      </div>

                      <div className="col-6">
                        <small className="text-muted">Table</small>

                        <div className="fw-semibold">
                          {order.table_name || "-"}
                        </div>
                      </div>

                      <div className="col-6">
                        <small className="text-muted">Waiter</small>

                        <div className="fw-semibold">
                          {order.waiter_name || "-"}
                        </div>
                      </div>

                      <div className="col-6">
                        <small className="text-muted">Floor</small>

                        <div className="fw-semibold">
                          {order.floor_name || "-"}
                        </div>
                      </div>

                      <div className="col-6">
                        <small className="text-muted">Area</small>

                        <div className="fw-semibold">
                          {order.area_name || "-"}
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
                      <div className="small text-muted">Created</div>

                      <div className="fw-semibold">
                        {formatTime(order.created_at)}
                      </div>
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

                        {/* NOTES */}
                        {item.notes && (
                          <div className="alert alert-warning py-2 mt-2">
                            ⚠ {item.notes}
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
