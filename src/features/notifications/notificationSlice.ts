import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotificationState } from "./notificationTypes";

const initialState: NotificationState = {
  message: "",
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearNotification: (state) => {
      state.message = "";
    },
  },
});

export const { showNotification, clearNotification } =
  notificationSlice.actions;

export default notificationSlice.reducer;
