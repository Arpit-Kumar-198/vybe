import express from "express";

import {
  editProfile,
  followOrUnfollow,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.get("/logout", logout);

// Get user profile
router.get("/:id/profile", isAuthenticated, getProfile);

// Edit profile
router.post(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePhoto"),
  editProfile,
);

// Get suggested users
router.get("/suggested", isAuthenticated, getSuggestedUsers);

// Follow / unfollow user
router.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);

export default router;
