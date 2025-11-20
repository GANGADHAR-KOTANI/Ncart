// src/redux/slices/bestSellingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";

export const fetchBestSelling = createAsyncThunk("bestSelling/fetch", async () => {
  const res = await fetch(`${API_URL}/api/seller/products/best-selling`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch best selling");

  // ✅ adapt for relatedProducts structure
  const formatted = (data.relatedProducts || []).map((item) => ({
    ...item,
    originalPrice: item.originalPrice || item.price,
    discountedPrice: item.discountedPrice || item.price,
  }));

  return formatted;
});

const bestSellingSlice = createSlice({
  name: "bestSelling",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBestSelling.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBestSelling.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchBestSelling.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default bestSellingSlice.reducer;
