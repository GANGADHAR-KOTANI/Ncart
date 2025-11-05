import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: {} },

  reducers: {
    addItem: (state, action) => {
      const item = action.payload;

      // ✅ Add only once
      if (!state.items[item._id]) {
        state.items[item._id] = { ...item, qty: 1 };
      } else {
        // ✅ Already exists → only increase qty
        state.items[item._id].qty += 1;
      }
    },

    incrementQty: (state, action) => {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id].qty += 1;
      }
    },

    decrementQty: (state, action) => {
      const id = action.payload;

      if (state.items[id]) {
        if (state.items[id].qty > 1) {
          state.items[id].qty -= 1;
        } else {
          // ✅ qty becomes zero → remove item
          delete state.items[id];
        }
      }
    }
  }
});

export const { addItem, incrementQty, decrementQty } = cartSlice.actions;
export default cartSlice.reducer;
