// src/redux/slices/offersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";

// ✅ Fetch and format exclusive offers
export const fetchOffers = createAsyncThunk("offers/fetchOffers", async () => {
  const res = await fetch(`${API_URL}/api/user/products/offers/exclusive`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch offers");

  const formattedOffers = (data.relatedOffers || []).map((item) => {
    const originalPrice = item.originalPrice || item.price;
    const price = item.discountedPrice || item.price || originalPrice;
    const sellerDiscount =
      item.sellerDiscount ??
      Math.round(((originalPrice - price) / originalPrice) * 100);

    return {
      ...item,
      originalPrice,
      discountedPrice: price,
      sellerDiscount: sellerDiscount > 0 ? sellerDiscount : 0,
    };
  });

  return formattedOffers;
});

const offersSlice = createSlice({
  name: "offers",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default offersSlice.reducer;
