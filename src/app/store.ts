import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "../features/notifications/notificationSlice";
import authReducers from "../features/auth/authSlice";
import passwordReducer from '../features/passwords/passwordSlice';


const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    auth: authReducers,
    passwords: passwordReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
