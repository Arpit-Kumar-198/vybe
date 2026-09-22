import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",

  initialState: {
    notifications: [],
    unreadCount: 0,
  },

  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },

    markAllAsRead: (state) => {
      state.unreadCount = 0;

      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  incrementUnreadCount,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
