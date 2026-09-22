import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import postSlice from "./postSlice.js";
import notificationReducer from "./notificationSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postSlice,
    notification: notificationReducer,
  },
});

export default store;
