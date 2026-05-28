// menuConfig.js

import adminMenu from "../dashboard/sidebar/adminMenu";
import kitchenMenu from "../dashboard/sidebar/kitchenMenu";
import posMenu from "../dashboard/sidebar/posMenu";
import waiterMenu from "../dashboard/sidebar/waiterMenu";
import managerMenu from "../dashboard/sidebar/managerMenu";
import customerMenu from "./sidebar/customerMenu";

export const getMenuByRole = (role) => {

  switch (role) {

    case "restaurant_admin":
      return adminMenu;

    case "waiter":
      return waiterMenu;

    case "kitchen":
      return kitchenMenu;

    case "cashier":
      return posMenu;

    case "manager":
      return managerMenu;

    case "customer":
      return customerMenu;

    default:
      return [];
  }

};