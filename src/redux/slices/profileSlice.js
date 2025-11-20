// src/redux/slices/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios_api from "../../config/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getToken from "../../utils/getToken";
import { API_URL } from "../../config/constants";

const BASE = "https://selecto-project.onrender.com";

/* -------------------------------------------------------------------------- */
/* 1️⃣ Fetch User Profile (Axios) - uses universal getToken()                 */
/* -------------------------------------------------------------------------- */
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const res = await axios_api.get(`${BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success)
        return rejectWithValue(res.data?.message || "Failed to fetch profile");

      // return the canonical user object
      return res.data.user || res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 2️⃣ Update Profile                                                          */
/* -------------------------------------------------------------------------- */
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (updates, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const res = await axios_api.put(`${BASE}/api/user/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success)
        return rejectWithValue(res.data?.message || "Failed to update profile");

      return res.data.user || updates;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 3️⃣ Fetch Addresses                                                         */
/* -------------------------------------------------------------------------- */
export const fetchAddresses = createAsyncThunk(
  "profile/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const res = await axios_api.get(`${BASE}/api/user/address/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success)
        return rejectWithValue(res.data?.message || "Failed to load addresses");

      return res.data.addresses || res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 4️⃣ Add Address                                                             */
/* -------------------------------------------------------------------------- */
export const addAddress = createAsyncThunk(
  "profile/addAddress",
  async (payload, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const body = {
        ...payload,
        latitude: payload.latitude ?? 17.3850,
        longitude: payload.longitude ?? 78.4867,
        isDefault: payload.isDefault ?? false,
      };

      const res = await axios_api.post(`${BASE}/api/user/address/add`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success)
        return rejectWithValue(res.data?.message || "Failed to add address");

      return res.data.address || body;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 5️⃣ Set Default Address                                                      */
/* -------------------------------------------------------------------------- */
export const setDefaultAddress = createAsyncThunk(
  "profile/setDefaultAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const res = await axios_api.put(
        `${BASE}/api/user/address/set-default`,
        { addressId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data?.success)
        return rejectWithValue(res.data?.message || "Failed to set default");

      return addressId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 6️⃣ Delete Address                                                           */
/* -------------------------------------------------------------------------- */
export const deleteAddress = createAsyncThunk(
  "profile/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const res = await axios_api.delete(`${BASE}/api/user/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success)
        return rejectWithValue(res.data?.message || "Failed to delete address");

      return addressId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 7️⃣ Fetch Completed Orders                                                   */
/* -------------------------------------------------------------------------- */
export const fetchOrders = createAsyncThunk(
  "profile/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue("No token");

      const res = await axios_api.get(
        `${BASE}/api/seller/orders/complete-orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.completeOrders) return res.data.completeOrders;
      if (Array.isArray(res.data)) return res.data;

      return rejectWithValue("Unexpected response format");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 8️⃣ Fetch Profile From API_URL (fallback using fetch)                       */
/* -------------------------------------------------------------------------- */
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, thunkAPI) => {
    try {
      const token = await getToken();
      if (!token) return thunkAPI.rejectWithValue("No token");

      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch profile");

      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 9️⃣ Slice                                                                    */
/* -------------------------------------------------------------------------- */
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,      // canonical user object
    profile: null,   // raw API_URL response (kept for compatibility)
    token: null,
    addresses: [],
    orders: [],
    loading: false,
    error: null,
    status: "idle",
  },

  reducers: {
    // Keep store token in memory and persist to AsyncStorage under single key "token"
    setToken(state, action) {
      state.token = action.payload;
      AsyncStorage.setItem("token", action.payload);
    },

    clearProfile(state) {
      state.user = null;
      state.profile = null;
      state.addresses = [];
      state.orders = [];
      state.token = null;
      state.error = null;
      state.status = "idle";
      AsyncStorage.removeItem("token");
    },

    setAddresses(state, action) {
      state.addresses = action.payload;
    },
  },

  extraReducers: (builder) => {
    /* -------- Profile Fetch (Axios) -------- */
    builder
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.user = { ...s.user, ...a.payload };
      });

    /* -------- Address Handling -------- */
    builder
      .addCase(fetchAddresses.fulfilled, (s, a) => {
        s.addresses = a.payload;
      })
      .addCase(addAddress.fulfilled, (s, a) => {
        s.addresses.push(a.payload);
      })
      .addCase(setDefaultAddress.fulfilled, (s, a) => {
        const id = a.payload;
        s.addresses = s.addresses.map((addr) => ({
          ...addr,
          isDefault: addr._id === id,
        }));
      })
      .addCase(deleteAddress.fulfilled, (s, a) => {
        s.addresses = s.addresses.filter((addr) => addr._id !== a.payload);
      });

    /* -------- Orders -------- */
    builder.addCase(fetchOrders.fulfilled, (s, a) => {
      s.orders = a.payload;
    });

    /* -------- Profile Fetch using API_URL (fallback) -------- */
    builder
      .addCase(fetchUserProfile.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.profile = a.payload;
        // IMPORTANT: ensure canonical `user` is also set so components expecting state.profile.user work
        s.user = a.payload;
      })
      .addCase(fetchUserProfile.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      });

    /* -------- Global Loaders & Errors -------- */
    builder.addMatcher((a) => a.type.endsWith("/pending"), (s) => {
      s.loading = true;
      s.error = null;
    });

    builder.addMatcher((a) => a.type.endsWith("/fulfilled"), (s) => {
      s.loading = false;
    });

    builder.addMatcher((a) => a.type.endsWith("/rejected"), (s, a) => {
      s.loading = false;
      s.error = a.payload || a.error?.message;
    });
  },
});

export const { clearProfile, setAddresses, setToken } = profileSlice.actions;
export default profileSlice.reducer;
