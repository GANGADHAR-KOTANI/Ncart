// src/redux/slices/filterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";

export const fetchCategories = createAsyncThunk(
  "filter/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        return data.categories;
      } else {
        return rejectWithValue("Unexpected API format");
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const filterSlice = createSlice({
  name: "filter",
  initialState: {
    categories: [],
    selectedCategory: null,
    price: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory =
        state.selectedCategory === action.payload ? null : action.payload;
    },
    setPrice: (state, action) => {
      state.price = action.payload;
    },
    resetFilters: (state) => {
      state.selectedCategory = null;
      state.price = 1000;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedCategory, setPrice, resetFilters } =
  filterSlice.actions;

export default filterSlice.reducer;
