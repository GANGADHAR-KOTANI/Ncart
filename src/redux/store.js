import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./slices/cartSlice";

import offersReducer from "./slices/offersSlice";
import bestSellingReducer from "./slices/bestSellingSlice";
import categoriesReducer from "./slices/categoriesSlice";
import storesReducer from "./slices/storesSlice";
// 👇 You likely forgot this import
import filterReducer from "./slices/filterSlice";
import addressReducer from "./slices/addressSlice";
import profileReducer from "./slices/profileSlice";
import categoryStoreReducer from "./slices/categoryStoreSlice";
import favoritesReducer from "./slices/favoritesSlice";
import addReducer from "./slices/address"
export const store = configureStore({
  reducer: {
    address: addressReducer,
    address:addReducer,
    profile: profileReducer,
    cart: cartReducer,
    favorites: favoritesReducer,
    offers: offersReducer,
    bestSelling: bestSellingReducer,
    categories: categoriesReducer,
    stores: storesReducer,
    // ✅ Add this line
    filter: filterReducer,
    categoryStores: categoryStoreReducer,
  },
});
 