import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "../features/notifications/notificationSlice";
// import counterReducers from "../features/auth/authTypes";
import authReducers from "../features/auth/authSlice";

const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    // counter: counterReducers
    auth: authReducers,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
