import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import postSlice from "./postSlice.js";
import notificationReducer from "./notificationSlice.js";
import chatSlice from "./chatSlice.js";
import rtnSlice from "./rtnSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postSlice,
    notification: notificationReducer,
    chat: chatSlice,
    realTimeNotification: rtnSlice,
  },
});

export default store;
