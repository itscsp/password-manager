import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from '../features/notifications/notificationSlice';
import counterReducers from "../features/auth/authTypes";

const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    counter: counterReducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
