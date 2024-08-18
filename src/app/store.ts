import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from '../features/notifications/notificationSlice';

const store = configureStore({
  reducer: {
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
