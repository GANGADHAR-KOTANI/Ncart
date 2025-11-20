
import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
  },

  reducers: {
    addAddress: (state, action) => {
      const newAddress = action.payload;

      // 🔄 Remove default from all if this one is default
      if (newAddress.isDefault) {
        state.addresses.forEach((addr) => (addr.isDefault = false));
      }

      // ✅ Push new address
      state.addresses.push({
        id: Date.now(), // temporary ID (backend will replace)
        name: newAddress.name,
        phone: newAddress.phone,
        addressLine: newAddress.addressLine,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        landmark: newAddress.landmark || "",
        isDefault: newAddress.isDefault,
      });
    },

    removeAddress: (state, action) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );
    },

    setDefaultAddress: (state, action) => {
      state.addresses.forEach((addr) => (addr.isDefault = false));

      const index = state.addresses.findIndex(
        (addr) => addr.id === action.payload
      );

      if (index !== -1) {
        state.addresses[index].isDefault = true;
      }
    },
  },
});

export const { addAddress, removeAddress, setDefaultAddress } =
  addressSlice.actions;

export default addressSlice.reducer;