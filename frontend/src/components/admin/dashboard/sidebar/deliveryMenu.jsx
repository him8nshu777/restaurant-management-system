import {
  HouseDoor,
  GeoAlt,
  BagCheck,
  ClockHistory,
  Heart,
  PersonCircle,
  Bell,
  Bicycle,
} from "react-bootstrap-icons";

const deliveryMenu = [

  {
    key: "orders",
    label: "Orders",
    icon: <Bell />
  },
  {
    key: "active-orders",
    label: "My Deliveries",
    icon: <Bicycle />
  },

  {
    key: "order-history",
    label: "Delivery History",
    icon: <ClockHistory />
  },

  {
    key: "profile",
    label: "Profile",
    icon: <PersonCircle />
  },

];

export default deliveryMenu;