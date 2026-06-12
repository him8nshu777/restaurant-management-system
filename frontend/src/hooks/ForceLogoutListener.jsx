import { useEffect } from "react";
import {useSelector, useDispatch } from "react-redux";

import { logout } from "../../src/auth/authSlice";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

export default function ForceLogoutListener() {
  const dispatch = useDispatch();
  const user = useSelector(
  (state) => state.auth.user
);

  useEffect(() => {
    if (!user) return;

  // STAFF ONLY
  if (user.role === "customer") {
    return;
  }
    const token = localStorage.getItem("access");

    if (!token) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/security/?token=${token}`);

    socket.onopen = () => {
      console.log("Force Logout WS Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("FORCE LOGOUT EVENT", data);
      if (data.type === "force_logout") {
        alert(data.message);

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        dispatch(logout());

        window.location.href = "/";
      }
    };

    socket.onclose = () => {
      console.log("Force Logout WS Closed");
    };

    return () => {
      socket.close();
    };
  }, [user, dispatch]);

  return null;
}
