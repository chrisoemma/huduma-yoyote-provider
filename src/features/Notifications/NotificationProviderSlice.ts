import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  viewed: boolean;
  createdAt: string; 
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const NotificationProviderSlice = createSlice({
  name: 'notificationsProvider',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markAsViewed: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.viewed = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {clearNotifications, addNotification, markAsViewed, removeNotification } = NotificationProviderSlice.actions;
export default NotificationProviderSlice.reducer;
