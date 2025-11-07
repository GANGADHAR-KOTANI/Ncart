// src/redux/slices/storeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchStoresByCategory = createAsyncThunk(
  "stores/fetchByCategory",
  async (category, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://selecto-project.onrender.com/apis/category/${encodeURIComponent(category)}/sellers`
      );

      console.log("Fetched stores for", category, ":", response.data);
      return response.data?.sellers || response.data || [];
    } catch (error) {
      console.error("Error fetching stores:", error);
      return rejectWithValue(
        error.response?.data?.message || "Error fetching stores"
      );
    }
  }
);

const storeSlice = createSlice({
  name: "stores",
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
        state.stores = action.payload;
      })
      .addCase(fetchStoresByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stores";
      });
  },
});

export const { setSelectedCategory } = storeSlice.actions;
export default storeSlice.reducer;
