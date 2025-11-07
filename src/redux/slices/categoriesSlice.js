import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";

export const fetchCategories = createAsyncThunk("categories/fetch", async () => {
  const res = await fetch(`${API_URL}/api/admin/all`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch categories");
  return data.categories;
});

const categoriesSlice = createSlice({
  name: "categories",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default categoriesSlice.reducer;
