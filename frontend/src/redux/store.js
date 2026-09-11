import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import postSlice from "./postSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postSlice,
  },
});

export default store;
