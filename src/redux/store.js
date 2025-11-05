// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slices/filterSlice"; // ✅ from your branch
import locationReducer from "./slices/locationSlice"; // ✅ from jahnavi branch
import cartReducer from "./slices/cartSlice"; // ✅ from jahnavi branch

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    location: locationReducer,
    cart: cartReducer,
  },
});
