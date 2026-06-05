import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Badge } from "react-bootstrap";

import {
  getActiveSessions,
  logoutDevice,
  logoutAllDevices,
} from "../../services/securityService";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

export default function ActiveDevicesPage() {
  const socketRef = useRef(null);

  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  const user = useSelector((state) => state.auth.user);

  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  // ==========================================
  // FETCH DEVICES
  // ==========================================
  const fetchSessions = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const data = await getActiveSessions(restaurantId);

      setSessions(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT SINGLE DEVICE
  // ==========================================
  const handleLogoutDevice = async (sessionId) => {
    const confirmed = window.confirm("Logout this device?");

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await logoutDevice(sessionId);
    } catch (error) {
      console.log(error);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOGOUT ALL DEVICES
  // ==========================================
  const handleLogoutAllDevices = async () => {
    const confirmed = window.confirm("Logout all active devices?");

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await logoutAllDevices(restaurantId);
    } catch (error) {
      console.log(error);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchSessions();
  }, [restaurantId]);

  // ==========================================
  // LIVE DEVICE EVENTS
  // ==========================================
  useEffect(() => {
    if (!restaurantId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(`${WS_BASE_URL}/ws/security/${restaurantId}/`);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Session WS Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // single device removed
      if (data.event === "session_removed") {
        setSessions((prev) => prev.filter((session) => session.id !== data.id));

        return;
      }

      // logout all devices
      if (data.event === "multiple_sessions_removed") {
        setSessions((prev) =>
          prev.filter(
            (session) => !data.ids.includes(session.id)
          )
        );

        return;
      }

      // new login
      setSessions((prev) => {
        const exists = prev.some((session) => session.id === data.id);

        if (exists) return prev;

        return [data, ...prev];
      });
    };

    socket.onerror = (error) => {
      console.log("Session WS Error", error);
    };

    socket.onclose = () => {
      console.log("Session WS Closed");
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

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >
        <h2 className="fw-bold">Active Devices</h2>

        <div
          className="
            d-flex
            gap-2
          "
        >
          <button
            className="
              btn
              btn-outline-primary
            "
            onClick={fetchSessions}
          >
            Refresh
          </button>

          <button
            className="
              btn
              btn-danger
            "
            disabled={actionLoading}
            onClick={handleLogoutAllDevices}
          >
            Logout All Devices
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && <div>Loading devices...</div>}

      {/* EMPTY */}
      {!loading && sessions.length === 0 && (
        <div
          className="
              alert
              alert-light
            "
        >
          No active devices found.
        </div>
      )}

      {/* TABLE */}
      {!loading && sessions.length > 0 && (
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
                <th>ID</th>

                <th>User</th>

                <th>Device</th>

                <th>Browser</th>

                <th>IP</th>

                <th>Login At</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.id}</td>

                  <td>{session.user_name}</td>

                  <td>{session.device_name}</td>

                  <td>{session.browser}</td>

                  <td>{session.ip_address}</td>

                  <td>{new Date(session.login_at).toLocaleString()}</td>

                  <td>
                    <Badge bg={session.is_active ? "success" : "secondary"}>
                      {session.is_active ? "Active" : "Offline"}
                    </Badge>
                  </td>

                  <td>
                    <button
                      className="
                            btn
                            btn-sm
                            btn-outline-danger
                          "
                      disabled={actionLoading}
                      onClick={() => handleLogoutDevice(session.id)}
                    >
                      Logout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
