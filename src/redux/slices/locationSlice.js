import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  coordinates: { latitude: null, longitude: null },
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation: (state, action) => {
      const { address, latitude, longitude } = action.payload;
      state.address = address || "";
      state.coordinates = { latitude, longitude };
    },
    clearLocation: (state) => {
      state.address = "";
      state.coordinates = { latitude: null, longitude: null };
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
