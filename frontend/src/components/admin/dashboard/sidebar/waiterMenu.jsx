// src/components/admin/dashboard/sidebar/waiterMenu.js

import {
  ClipboardCheck,
  Table,
  BellFill,
} from "react-bootstrap-icons";

const waiterMenu = [

  {
    key: "waiter-dashboard",
    label: "Dashboard",
    icon: <ClipboardCheck />
  },

  {
    key: "orders",
    label: "Orders",
    icon: <Table />
  },

  {
    key: "ready-orders",
    label: "Ready Orders",
    icon: <BellFill />,
  },

];

export default waiterMenu;