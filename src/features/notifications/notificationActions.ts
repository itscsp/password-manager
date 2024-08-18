import { AppDispatch } from '../../app/store';
import { addNotification } from './notificationSlice';
import { Notification } from './notificationTypes';

export const showNotification = (notification: Notification) => (dispatch: AppDispatch) => {
  dispatch(addNotification(notification));
  setTimeout(() => {
    dispatch(removeNotification(notification.id));
  }, 3000); // Remove notification after 3 seconds
};
