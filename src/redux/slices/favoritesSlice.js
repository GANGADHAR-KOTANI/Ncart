import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import { API_URL } from "../../config/constants";
import { createSelector } from "reselect"; 
import getToken from "../../utils/getToken";   // ✅ Use universal token

/** Fetch favorites */
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) return [];

      const res = await fetch(`${API_URL}/api/user/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch favorites");

      return data.groupedFavorites || [];
    } catch (error) {
      console.log("fetchFavorites error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/** Toggle favorite */
export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) {
        Alert.alert("Login Required", "Please login to continue");
        return rejectWithValue("No token found");
      }

      const res = await fetch(`${API_URL}/api/user/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle favorite");

      dispatch(fetchFavorites());
      return true;
    } catch (error) {
      console.log("toggleFavorite error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/** Slice */
const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default favoritesSlice.reducer;

/* -----------------------------------------------------------
   MEMOIZED SELECTOR (DO NOT MODIFY)
----------------------------------------------------------- */

export const selectFavoriteIds = createSelector(
  [(state) => state.favorites.items],

  (items) => {
    const favSet = new Set();

    items?.forEach((group) => {
      group.items?.forEach((fav) => {
        const id = fav.productId?._id || fav.productId;
        if (id) favSet.add(String(id));
      });

      group.products?.forEach((p) => {
        if (p?._id) favSet.add(String(p._id));
      });
    });

    return favSet;
  }
);
