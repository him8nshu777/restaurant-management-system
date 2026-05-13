// Redux Toolkit method used to create
// authentication state slice
import { createSlice }
from "@reduxjs/toolkit";


// Initial authentication state
// This runs when application starts
const initialState = {

  // Access token used for
  // authenticated API requests
  access:
    localStorage.getItem("access"),

  // Refresh token used to
  // generate new access tokens
  refresh:
    localStorage.getItem("refresh"),

  // Logged in user data
  // Stored in localStorage to
  // persist login after refresh
  user:
    JSON.parse(
      localStorage.getItem("user")
    ),

  // Checks whether user is
  // authenticated or not
  isAuthenticated:
    !!localStorage.getItem(
      "access"
    ),
};


// Authentication slice
// Handles login/logout state
const authSlice = createSlice({

  // Slice name
  name: "auth",

  // Default state
  initialState,

  // Reducer functions
  reducers: {

    // Runs after successful login
    loginSuccess:
      (state, action) => {

        // Store access token
        state.access =
          action.payload.access;

        // Store refresh token
        state.refresh =
          action.payload.refresh;

        // Store logged in user data
        state.user =
          action.payload.user;

        // Mark user authenticated
        state.isAuthenticated =
          true;

        // Persist access token
        // in browser localStorage
        localStorage.setItem(
          "access",
          action.payload.access
        );

        // Persist refresh token
        localStorage.setItem(
          "refresh",
          action.payload.refresh
        );

        // Persist user object
        localStorage.setItem(
          "user",

          JSON.stringify(
            action.payload.user
          )
        );
      },


    // Runs during logout
    logout:
      (state) => {

        // Remove access token
        state.access = null;

        // Remove refresh token
        state.refresh = null;

        // Remove user data
        state.user = null;

        // Mark user unauthenticated
        state.isAuthenticated =
          false;

        // Clear tokens from localStorage
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


// Export reducer actions
export const {
  loginSuccess,
  logout,
} = authSlice.actions;


// Export reducer to store
export default authSlice.reducer;