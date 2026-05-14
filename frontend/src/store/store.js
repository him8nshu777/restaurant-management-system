import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../auth/authSlice";
import restaurantReducer from "../features/restaurants/restaurantSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurant: restaurantReducer,
  },
});