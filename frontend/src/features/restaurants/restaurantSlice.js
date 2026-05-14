import {
    createSlice,
} from "@reduxjs/toolkit";


// ==========================================
// GET SAVED RESTAURANT
// ==========================================
const savedRestaurant =
    localStorage.getItem(
        "activeRestaurant"
    );


// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {

    activeRestaurant:
        savedRestaurant
            ? JSON.parse(savedRestaurant)
            : null,
};


// ==========================================
// SLICE
// ==========================================
const restaurantSlice =
    createSlice({

        name: "restaurant",

        initialState,

        reducers: {

            setActiveRestaurant:
                (state, action) => {

                    state.activeRestaurant =
                        action.payload;
                },
        },
    });


// ==========================================
// EXPORTS
// ==========================================
export const {
    setActiveRestaurant,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;