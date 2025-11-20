import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getToken from "../../utils/getToken";       // ✅ Use universal token getter
import { API_URL } from "../../config/constants";

// 🔹 Save user address to backend
export const saveUserAddress = createAsyncThunk(
  "address/saveUserAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const token = await getToken();   // ✅ unified token usage

      const res = await fetch(`${API_URL}/api/user/address/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(addressData),
      });

      const data = await res.json();
      console.log("📍 Address Save Response:", res.status, data);

      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to save address");
      }

      return data.address;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    currentAddress: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveUserAddress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveUserAddress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAddress = action.payload;
      })
      .addCase(saveUserAddress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save address";
      });
  },
});

export default addressSlice.reducer;
