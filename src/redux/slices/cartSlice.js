// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/constants";
import getToken from "../../utils/getToken";   // ✅ Use universal token getter

// 🔹 Fetch entire cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch cart");

      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add item");

      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Remove one quantity
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove item");

      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Delete one cart item permanently
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ productId }, { rejectWithValue, dispatch }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/cart/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete item");

      await dispatch(fetchCart());
      return data.cart;
    } catch (err) {
      console.error("❌ deleteCartItem failed:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Clear entire cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = await getToken();   // ✅ unified token
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const rawText = await res.text();
      console.log("🧾 clearCart raw response:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Invalid JSON from server. Raw: ${rawText.slice(0, 80)}...`
        );
      }

      if (!res.ok) throw new Error(data.message || "Failed to clear cart");

      await AsyncStorage.removeItem("cart");
      await AsyncStorage.removeItem("cartItems");

      dispatch({ type: "cart/clearLocal" });
      await dispatch(fetchCart());

      return { sellers: [], totalPrice: 0, cartItemCount: 0 };
    } catch (err) {
      console.error("❌ clearCart failed:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

// ------------------ SLICE ------------------
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    sellers: [],
    totalPrice: 0,
    cartItemCount: 0,
    loading: false,
    error: null,
  },

  reducers: {
    localIncrement: (state, action) => {
      const productId = action.payload.productId;
      for (const seller of state.sellers) {
        for (const item of seller.items) {
          if (item.productId?._id === productId) {
            item.quantity += 1;
            item.total = item.quantity * item.productId.price;
          }
        }
      }
      state.cartItemCount += 1;
      state.totalPrice = state.sellers.reduce(
        (sum, s) => sum + s.items.reduce((t, i) => t + i.total, 0),
        0
      );
    },

    localDecrement: (state, action) => {
      const productId = action.payload.productId;
      for (const seller of state.sellers) {
        for (const item of seller.items) {
          if (item.productId?._id === productId && item.quantity > 1) {
            item.quantity -= 1;
            item.total = item.quantity * item.productId.price;
            state.cartItemCount -= 1;
          }
        }
      }
      state.totalPrice = state.sellers.reduce(
        (sum, s) => sum + s.items.reduce((t, i) => t + i.total, 0),
        0
      );
    },

    localDelete: (state, action) => {
      const id = action.payload.cartItemId;
      for (const seller of state.sellers) {
        seller.items = seller.items.filter((i) => i.productId?._id !== id);
      }
      state.sellers = state.sellers.filter((s) => s.items.length > 0);

      let total = 0;
      let count = 0;
      for (const s of state.sellers) {
        s.sellerTotal = s.items.reduce((sum, i) => sum + i.total, 0);
        total += s.sellerTotal;
        count += s.items.reduce((sum, i) => sum + i.quantity, 0);
      }
      state.totalPrice = total;
      state.cartItemCount = count;
    },

    clearLocal: (state) => {
      state.sellers = [];
      state.totalPrice = 0;
      state.cartItemCount = 0;
      state.error = null;
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (action.payload?.sellers?.length) {
          state.sellers = action.payload.sellers;
          state.totalPrice = action.payload.totalPrice;
          state.cartItemCount = action.payload.cartItemCount;
        } else {
          state.sellers = [];
          state.totalPrice = 0;
          state.cartItemCount = 0;
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        if (action.payload?.sellers) {
          state.sellers = action.payload.sellers;
          state.totalPrice = action.payload.totalPrice;
          state.cartItemCount = action.payload.cartItemCount;
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload?.sellers) {
          state.sellers = action.payload.sellers;
          state.totalPrice = action.payload.totalPrice;
          state.cartItemCount = action.payload.cartItemCount;
        }
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.sellers = [];
        state.totalPrice = 0;
        state.cartItemCount = 0;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { localIncrement, localDecrement, localDelete, clearLocal } =
  cartSlice.actions;

export default cartSlice.reducer;
