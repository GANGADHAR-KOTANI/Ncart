// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/constants";

/**
 * Build authorization header using either state token or AsyncStorage token.
 */
const getAuthHeader = async (getState) => {
  const token = getState().user?.token || (await AsyncStorage.getItem("token"));
  if (!token) throw new Error("No token found");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Normalizes many possible backend shapes into:
 * [
 *   {
 *     productId: string,
 *     quantity: number,
 *     product: { _id, name, price, image, ... } // optional product details
 *   },
 *   ...
 * ]
 */
const normalizeCart = (data) => {
  if (!data) return [];

  // If backend already returns array of normalized items
  let rawItems = [];

  if (Array.isArray(data)) rawItems = data;
  else if (data.items && Array.isArray(data.items)) rawItems = data.items;
  else if (data.cart && Array.isArray(data.cart)) rawItems = data.cart;
  else if (data.cart && data.cart.items && Array.isArray(data.cart.items))
    rawItems = data.cart.items;
  else if (data.items && data.items.data && Array.isArray(data.items.data))
    rawItems = data.items.data;
  else {
    // If it's an object representing single item
    rawItems = [data];
  }

  // Map raw items to stable shape
  const items = rawItems
    .map((it) => {
      if (!it) return null;

      // Try to find product details and id
      const productObj =
        it.product ||
        it.productDetail ||
        it.product_info ||
        (it.productId && it.product) ||
        it.item ||
        null;

      const productId =
        (it.productId && String(it.productId)) ||
        (productObj && (productObj._id || productObj.id)) ||
        it._id ||
        it.id ||
        null;

      const quantity =
        Number(
          it.quantity ??
            it.qty ??
            it.count ??
            (it.quantity && it.quantity.count) ??
            0
        ) || 0;

      // product-level fallback properties (name, price, images)
      const product = {
        _id: productId,
        name: productObj?.name ?? it.name ?? productObj?.title ?? undefined,
        price: productObj?.price ?? it.price ?? productObj?.cost ?? undefined,
        image:
          productObj?.image ??
          productObj?.images ??
          it.image ??
          it.images ??
          (Array.isArray(productObj?.images) ? productObj.images[0] : undefined),
        raw: productObj ?? it,
      };

      if (!productId) return null;

      return {
        productId,
        quantity: quantity > 0 ? quantity : 1, // default to 1 if server didn't give quantity
        product,
      };
    })
    .filter(Boolean);

  return items;
};

/* ---------- Thunks ---------- */

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = await getAuthHeader(getState);
      const res = await fetch(`${API_URL}/api/cart/`, { headers });
      const data = await res.json();

      if (res.ok && data.success) {
        return normalizeCart(data.cart || data);
      }

      throw new Error(data.message || "Failed to fetch cart");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * addToCart: backend expected to increment item quantity (by 1) or add the product.
 * We pass productId (string). Server returns updated cart.
 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const headers = await getAuthHeader(getState);
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        return normalizeCart(data.cart || data);
      }

      throw new Error(data.message || "Failed to add item");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * removeFromCart: backend expected to decrement qty by 1 or remove item if qty becomes 0
 * We pass productId (string). Server returns updated cart.
 */
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const headers = await getAuthHeader(getState);
      const res = await fetch(`${API_URL}/api/cart/remove`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        return normalizeCart(data.cart || data);
      }

      throw new Error(data.message || "Failed to remove item");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ---------- Slice ---------- */

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // optional local-only helpers (not used now)
    clearCartLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = normalizeCart(action.payload);
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = normalizeCart(action.payload);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = normalizeCart(action.payload);
      })
      .addMatcher((action) => action.type.endsWith("/pending"), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith("/fulfilled"), (state) => {
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message;
        }
      );
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
