import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  message: " ",
  severity: "success",
};

export const snackBarSlice = createSlice({
  name: "snackBar",
  initialState,
  reducers: {
    openSnackBar: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    closeSnackBar: (state) => {
      state.open = false;
    },
  },
});

export const { openSnackBar, closeSnackBar } = snackBarSlice.actions;
export default snackBarSlice.reducer;
