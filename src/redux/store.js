import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./slices/locationSlice";
import cartReducer from "./slices/cartSlice";

const store = configureStore({
  reducer: {
    location: locationReducer,
    cart: cartReducer
  },
});

export default store;
