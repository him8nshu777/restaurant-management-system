import {
  HouseDoor,
  GeoAlt,
  BagCheck,
  ClockHistory,
  Heart,
  PersonCircle,
} from "react-bootstrap-icons";

const customerMenu = [

  {
    key: "restaurants",
    label: "Nearby Restaurants",
    icon: <HouseDoor />
  },

  {
    key: "saved-addresses",
    label: "Saved Addresses",
    icon: <GeoAlt />
  },

  {
    key: "current-orders",
    label: "Current Orders",
    icon: <BagCheck />
  },

  {
    key: "order-history",
    label: "Order History",
    icon: <ClockHistory />
  },

  {
    key: "favorites",
    label: "Favorites",
    icon: <Heart />
  },

  {
    key: "profile",
    label: "Profile",
    icon: <PersonCircle />
  },

];

export default customerMenu;