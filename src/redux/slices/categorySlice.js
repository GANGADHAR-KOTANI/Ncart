import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Async thunk for fetching categories (with optional search)
export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (search = "") => {
    try {
      const url = search
        ? `https://selecto-project.onrender.com/api/user/categories?search=${search}`
        : "https://selecto-project.onrender.com/api/admin/all";

      const response = await axios.get(url);
      // Handle response shape for both endpoints
      return response.data.categories || [];
    } catch (error) {
      throw Error(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;
