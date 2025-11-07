import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/constants";

export const fetchStores = createAsyncThunk("stores/fetch", async () => {
  const res = await fetch(`${API_URL}/apis/sellers`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch stores");

  const filtered = data.sellers.filter(
    (s) => !["lachi store", "lachi grocery"].includes(s.shopName?.toLowerCase())
  );

  return filtered.map((store) => ({
    ...store,
    location: store.address || store.location || "Location not specified",
    rating: typeof store.rating === "number" ? parseFloat(store.rating.toFixed(1)) : 4.2,
  }));
});

const storesSlice = createSlice({
  name: "stores",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default storesSlice.reducer;
