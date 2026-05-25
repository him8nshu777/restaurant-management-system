import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useSelector,
} from "react-redux";

import {
  getOrderList,
  updateOrder,
} from "../../services/orderService";

// ==========================================
// API / WS BASE URL
// ==========================================
const WS_BASE_URL =
  import.meta.env
    .VITE_WS_BASE_URL ||
  "ws://127.0.0.1:8000";

// ==========================================
// KITCHEN ORDERS
// ==========================================
export default function KitchenOrders() {

  // ========================================
  // REFS
  // ========================================
  const socketRef =
    useRef(null);

  const audioRef =
    useRef(null);

  // ========================================
  // ACTIVE RESTAURANT
  // ========================================
  const activeRestaurant =
    useSelector(
      (state) =>
        state.restaurant
          .activeRestaurant
    );

    const user = useSelector(
  (state) => state.auth.user
);

const restaurantId =
  user?.role === "restaurant_admin"
    ? activeRestaurant?.id
    : user?.restaurant_id;

  // ========================================
  // STATES
  // ========================================
  const [orders, setOrders] =
    useState([]);

  const [isConnected, setIsConnected] =
    useState(false);

  const [
    liveNotification,
    setLiveNotification
  ] = useState(null);

  // ========================================
  // UNLOCK AUDIO
  // BROWSER BLOCKS AUTOPLAY
  // ========================================
  useEffect(() => {

    const unlockAudio =
      async () => {

        try {

          if (
            !audioRef.current
          ) {
            return;
          }

          audioRef.current.volume = 0;

          await audioRef.current.play();

          audioRef.current.pause();

          audioRef.current.currentTime = 0;

          audioRef.current.volume = 1;

          console.log(
            "Audio unlocked"
          );

        }

        catch (error) {

          console.log(
            "Audio unlock failed:",
            error
          );

        }

        window.removeEventListener(
          "click",
          unlockAudio
        );

      };

    window.addEventListener(
      "click",
      unlockAudio
    );

    return () => {

      window.removeEventListener(
        "click",
        unlockAudio
      );

    };

  }, []);

  // ========================================
  // FETCH ORDERS
  // ========================================
  const fetchOrders =
    async () => {

      try {

        const data =
          await getOrderList(
            restaurantId
          );

        const filteredOrders =
          data.filter(
            (order) =>
              order.status !==
                "completed" &&
              order.status !==
                "cancelled"
          );

        setOrders(
          filteredOrders
        );

      }

      catch (error) {

        console.log(error);

      }

    };

  // ========================================
  // INITIAL LOAD
  // ========================================
  useEffect(() => {

    if (
      restaurantId
    ) {

      fetchOrders();

    }

  }, [restaurantId]);

  // ========================================
  // PLAY SOUND
  // ========================================
  const playNotificationSound =
    () => {

      try {

        if (
          !audioRef.current
        ) {
          console.log(
            "Audio ref missing"
          );

          return;
        }

        audioRef.current.pause();

        audioRef.current.currentTime = 0;

        const playPromise =
          audioRef.current.play();

        if (playPromise !== undefined) {

          playPromise
            .then(() => {

              console.log(
                "Sound played"
              );

            })
            .catch((error) => {

              console.log(
                "Audio play failed:",
                error
              );

            });

        }

      }

      catch (error) {

        console.log(
          "Play sound error:",
          error
        );

      }

    };

  // ========================================
  // AUTO HIDE NOTIFICATION
  // ========================================
  useEffect(() => {

    if (
      !liveNotification
    ) {
      return;
    }

    const timer =
      setTimeout(() => {

        setLiveNotification(
          null
        );

      }, 4000);

    return () =>
      clearTimeout(timer);

  }, [liveNotification]);

  // ========================================
  // WEBSOCKET
  // ========================================
  useEffect(() => {

    if (
      !restaurantId
    ) {
      return;
    }

    // ======================================
    // CLOSE OLD SOCKET
    // ======================================
    if (
      socketRef.current
    ) {

      socketRef.current.close();

    }

    // ======================================
    // SOCKET URL
    // ======================================
    const socketUrl =
      `${WS_BASE_URL}/ws/kitchen/${restaurantId}/`;

    // ======================================
    // CREATE SOCKET
    // ======================================
    const socket =
      new WebSocket(
        socketUrl
      );

    socketRef.current =
      socket;

    // ======================================
    // OPEN
    // ======================================
    socket.onopen =
      () => {

        console.log(
          "WebSocket Connected"
        );

        setIsConnected(
          true
        );

      };

    // ======================================
    // MESSAGE
    // ======================================
    socket.onmessage =
      (event) => {

        const data =
          JSON.parse(
            event.data
          );

        console.log(
          "WS EVENT:",
          data
        );

        // IMPORTANT
        // YOUR BACKEND SENDS:
        // { event: "new_order" }
        if (
          data.event ===
          "new_order"
        ) {

          console.log(
            "NEW ORDER RECEIVED"
          );

          // PLAY SOUND
          playNotificationSound();

          // SHOW LIVE ALERT
          setLiveNotification({
            message:
              `New Order ${data.order.order_number}`,
          });

        }

        fetchOrders();

      };

    // ======================================
    // ERROR
    // ======================================
    socket.onerror =
      (error) => {

        console.log(
          "Socket Error:",
          error
        );

      };

    // ======================================
    // CLOSE
    // ======================================
    socket.onclose =
      () => {

        console.log(
          "WebSocket Disconnected"
        );

        setIsConnected(
          false
        );

      };

    // ======================================
    // CLEANUP
    // ======================================
    return () => {

      if (
        socket.readyState ===
          WebSocket.OPEN ||
        socket.readyState ===
          WebSocket.CONNECTING
      ) {

        socket.close();

      }

    };

  }, [restaurantId]);

  // ========================================
  // UPDATE STATUS
  // ========================================
  const updateStatus =
  async (
    orderId,
    status
  ) => {

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
          : order
      )
    );

    try {

      await updateOrder(
        orderId,
        {
          status,
        }
      );

    }

    catch (error) {

      console.log(error);

      // OPTIONAL:
      // REFRESH IF FAILED
      fetchOrders();

    }

  };

  // ========================================
  // STATUS BADGE
  // ========================================
  const getStatusBadge =
    (status) => {

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

  return new Date(dateString).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

};

  return (

    <>
      {/* AUDIO */}
      <audio
        ref={audioRef}
        preload="auto"
      >
        <source
          src="/sounds/order-alert.mp3"
          type="audio/mpeg"
        />
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

            <div className="me-2">
              🔔
            </div>

            <div>
              {
                liveNotification.message
              }
            </div>

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

            <h2 className="fw-bold mb-1">
              Kitchen Display System
            </h2>

            <small className="text-muted">
              Live Kitchen Orders
            </small>

          </div>

          {/* SOCKET STATUS */}
          <div>

            <span
              className={`
                badge
                ${
                  isConnected
                    ? "bg-success"
                    : "bg-danger"
                }
              `}
            >

              {
                isConnected
                  ? "Live"
                  : "Disconnected"
              }

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

              <h5>
                No Active Orders
              </h5>

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

                      <h5 className="fw-bold mb-1">
                        {
                          order.order_number
                        }
                      </h5>

                      <small className="text-muted">

                        {
                          order.order_type
                        }

                      </small>

                    </div>

                    <span
                      className={`
                        badge
                        ${getStatusBadge(
                          order.status
                        )}
                      `}
                    >

                      {order.status}

                    </span>

                  </div>

                  {/* INFO */}
<div className="mb-3">

  <div className="row g-2">

    <div className="col-6">

      <div className="small text-muted">
        Order Type
      </div>

      <div className="fw-semibold">
        {order.order_type || "-"}
      </div>

    </div>

    <div className="col-6">

      <div className="small text-muted">
        Table
      </div>

      <div className="fw-semibold">
        {order.table_name || "-"}
      </div>

    </div>
    <div className="col-6">

    <div className="small text-muted">
        Waiter
      </div>

      <div className="fw-semibold">
        {order.waiter_name || "-"}
      </div>

    </div>
    <div className="col-6">

      <div className="small text-muted">
        Floor
      </div>

      <div className="fw-semibold">
        {order.floor_name || "-"}
      </div>

    </div>

    <div className="col-6">

      <div className="small text-muted">
        Area
      </div>

      <div className="fw-semibold">
        {order.area_name || "-"}
      </div>

    </div>
                        
    <div className="col-6">

      <div className="small text-muted">
        Total
      </div>

      <div className="fw-semibold">
        ₹{order.grand_total}
      </div>

    </div>

    <div className="col-6">

      <div className="small text-muted">
        Created
      </div>

      <div className="fw-semibold">
        {formatTime(order.created_at)}
      </div>

    </div>

  </div>

</div>
{/* OVERALL ORDER NOTE */}
{order.notes && (

  <div
    className="
      alert
      alert-danger
      py-2
      mb-3
    "
  >

    <strong>
      Order Note:
    </strong>{" "}

    {order.notes}

  </div>

)}
                  <hr />

                  {/* ITEMS */}
                  <div>

                    {order.items?.map(
                      (item) => (

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

                            <div>

                              <strong>

                                {
                                  item.quantity
                                }x{" "}

                                {
                                  item.item_name
                                }

                              </strong>

                            </div>

                            <span
                              className="
                                badge
                                bg-dark
                              "
                            >

                              ₹
                              {
                                item.total_price
                              }

                            </span>

                          </div>

                          {/* NOTES */}
                          {item.notes && (

                            <div
                              className="
                                alert
                                alert-warning
                                py-2
                                mb-2
                              "
                            >

                              <strong>
                                Note:
                              </strong>{" "}

                              {
                                item.notes
                              }

                            </div>

                          )}

                          {/* ADDONS */}
                          {item.addons
                            ?.length >
                            0 && (

                            <div>

                              <small
                                className="
                                  fw-bold
                                  text-muted
                                "
                              >
                                Addons
                              </small>

                              {item.addons.map(
                                (
                                  addon
                                ) => (

                                  <div
                                    key={
                                      addon.id
                                    }
                                    className="
                                      small
                                      text-muted
                                      ms-2
                                    "
                                  >

                                    •{" "}

                                    {
                                      addon.quantity
                                    }x{" "}

                                    {
                                      addon.addon_name
                                    }

                                  </div>

                                )
                              )}

                            </div>

                          )}

                        </div>

                      )
                    )}

                  </div>

                  {/* ACTIONS */}
<div className="mt-3">

  <select
    className="form-select"
    value={order.status}
    onChange={(e) =>
      updateStatus(
        order.id,
        e.target.value
      )
    }
  >

    <option value="saved">
      Saved
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

  </select>

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