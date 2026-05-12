import { createSlice }
from "@reduxjs/toolkit";


const initialState = {

  access:
    localStorage.getItem("access"),

  refresh:
    localStorage.getItem("refresh"),

  user:
    JSON.parse(
      localStorage.getItem("user")
    ),

  isAuthenticated:
    !!localStorage.getItem(
      "access"
    ),
};


const authSlice = createSlice({

  name: "auth",

  initialState,

  reducers: {

    loginSuccess:
      (state, action) => {

        state.access =
          action.payload.access;

        state.refresh =
          action.payload.refresh;

        state.user =
          action.payload.user;

        state.isAuthenticated =
          true;

        localStorage.setItem(
          "access",
          action.payload.access
        );

        localStorage.setItem(
          "refresh",
          action.payload.refresh
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            action.payload.user
          )
        );
      },

    logout:
      (state) => {

        state.access = null;

        state.refresh = null;

        state.user = null;

        state.isAuthenticated =
          false;

        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        localStorage.removeItem(
          "user"
        );
      },
  },
});


export const {
  loginSuccess,
  logout,
} = authSlice.actions;

export default authSlice.reducer;