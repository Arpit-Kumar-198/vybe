import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";

import {
  getMessage,
  sendMessage,
  getChatUsers,
} from "../controllers/message.controller.js";

const router = express.Router();

// Send a message
router.post("/send/:id", isAuthenticated, sendMessage);

// Get messages with a user
router.get("/all/:id", isAuthenticated, getMessage);

// Get users with whom current user has chatted
router.get("/users", isAuthenticated, getChatUsers);

export default router;
