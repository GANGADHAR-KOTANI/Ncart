import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";
import locationReducer from "./slices/locationSlice";
import offersReducer from "./slices/offersSlice";
import bestSellingReducer from "./slices/bestSellingSlice";
import categoriesReducer from "./slices/categoriesSlice";
import storesReducer from "./slices/storesSlice";
// 👇 You likely forgot this import
import filterReducer from "./slices/filterSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    location: locationReducer,
    offers: offersReducer,
    bestSelling: bestSellingReducer,
    categories: categoriesReducer,
    stores: storesReducer,
    // ✅ Add this line
    filter: filterReducer,
  },
});
 