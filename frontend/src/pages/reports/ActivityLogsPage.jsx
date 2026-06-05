import { useEffect, useState, useRef } from "react";

import { useSelector } from "react-redux";

import { Badge } from "react-bootstrap";

import { getActivityLogs } from "../../services/activityLogService";

// ==========================================
// API / WS BASE URL
// ==========================================
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

export default function ActivityLogsPage() {

  const socketRef = useRef(null);

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(false);

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  const user = useSelector((state) => state.auth.user);

  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  // ==========================================
  // FETCH LOGS
  // ==========================================
  const fetchLogs = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const data = await getActivityLogs(restaurantId);

      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchLogs();
  }, [restaurantId]);

  // ==========================================
// LIVE ACTIVITY LOGS
// ==========================================
useEffect(() => {
  if (!restaurantId) return;

  if (socketRef.current) {
    socketRef.current.close();
  }

  const socket = new WebSocket(
    `${WS_BASE_URL}/ws/audit/${restaurantId}/`
  );

  socketRef.current = socket;

  socket.onopen = () => {
    console.log("Audit WS Connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log("NEW LOG:", data);

    setLogs((prev) => {
  const exists = prev.some((log) => log.id === data.id);

  if (exists) return prev;

  return [
    {
      id: data.id,
      action: data.action,
      message: data.message,
      role: data.role,
      user_name: data.user,
      created_at: data.created_at,
    },
    ...prev,
  ];
});


  };

  socket.onerror = (error) => {
    console.log("Audit WS Error", error);
  };

  socket.onclose = () => {
    console.log("Audit WS Disconnected");
  };

  return () => {
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  };
}, [restaurantId]);


  // ==========================================
  // BADGE COLOR
  // ==========================================
  const getBadgeColor = (action) => {
    switch (action) {
      case "login":
        return "success";

      case "logout":
        return "secondary";

      case "order_created":
        return "primary";
      
      case "order_deleted":
        return "danger";

      case "order_updated":
        return "info";

      case "confirmed":
        return "info";

      case "preparing":
        return "warning";

      case "ready":
        return "success";

      case "served":
        return "dark";

      case "completed":
        return "success";

      case "cancelled":
        return "danger";

      case "waiter_changed":
        return "secondary";

      default:
        return "secondary";
    }
  };

  return (
    <div className="container-fluid">
      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >
        <h2 className="fw-bold">Activity Logs</h2>

        <button
          className="
            btn
            btn-outline-primary
          "
          onClick={fetchLogs}
        >
          Refresh
        </button>
      </div>

      {loading && <div>Loading logs...</div>}

      {!loading && logs.length === 0 && (
        <div
          className="
              alert
              alert-light
            "
        >
          No activity found.
        </div>
      )}

      {!loading && logs.length > 0 && (
  <div className="table-responsive">
    <table
      className="
        table
        table-sm
        table-striped
        table-hover
        align-middle
      "
    >
      <thead className="table-light">
        <tr>
          <th style={{ width: "30px" }}>ID</th>

          <th style={{ width: "175px" }}>Time</th>

          <th style={{ width: "150px" }}>User</th>

          <th style={{ width: "120px" }}>Role</th>

          <th style={{ width: "130px" }}>Action</th>

          <th>Message</th>
        </tr>
      </thead>

      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td>{log.id}</td>

            <td className="small">
              {new Date(log.created_at).toLocaleString()}
            </td>

            <td>{log.user_name || "System"}</td>

            <td>
              <small>{log.role}</small>
            </td>

            <td>
              <Badge bg={getBadgeColor(log.action)}>
                {log.action}
              </Badge>
            </td>

            <td>{log.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
    </div>
  );
}
