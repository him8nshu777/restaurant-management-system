// src/components/admin/dashboard/sidebar/posMenu.js

import {
  ClipboardCheck,
  Shop,

} from "react-bootstrap-icons";

const posMenu = [

  {
    key: "pos-dashboard",
    label: "POSDashboard",
    icon: <Shop />
  },
  {
    key: "orders",
    label: "Orders",
    icon: <ClipboardCheck />,
  },

];

export default posMenu;