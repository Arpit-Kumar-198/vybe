import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
} from "../controllers/notification.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotifications);

router.get("/unread-count", isAuthenticated, getUnreadNotificationCount);

router.patch("/mark-read", isAuthenticated, markNotificationsAsRead);

export default router;
