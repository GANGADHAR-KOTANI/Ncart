import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categorySlice";
import storeReducer from "./slices/storeSlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    stores: storeReducer,
  },
});

export default store;
