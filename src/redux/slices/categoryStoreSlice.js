// src/redux/slices/categoryStoreSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Fetch stores by category
export const fetchStoresByCategory = createAsyncThunk(
  "categoryStores/fetchByCategory",
  async (category, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://selecto-project.onrender.com/apis/category/${encodeURIComponent(category)}/sellers`
      );

      console.log("Fetched stores for", category, ":", response.data);

      // ⭐ FIX: API returns { category, sellers, ... }
      // We must return BOTH category + sellers
      return {
        category: response.data?.category || category,
        sellers: response.data?.sellers || [],
      };

    } catch (error) {
      console.error("Error fetching stores:", error);
      return rejectWithValue(
        error.response?.data?.message || "Error fetching stores"
      );
    }
  }
);

const categoryStoreSlice = createSlice({
  name: "categoryStores",
  initialState: {
    stores: [],
    selectedCategory: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoresByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoresByCategory.fulfilled, (state, action) => {
        state.loading = false;

        const { category, sellers } = action.payload;

        // ⭐ FIX: attach category to every store
        state.stores = sellers.map((store) => ({
          ...store,
          category, // ← now store.category ALWAYS exists
        }));
      })
      .addCase(fetchStoresByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stores";
      });
  },
});

export const { setSelectedCategory } = categoryStoreSlice.actions;
export default categoryStoreSlice.reducer;
