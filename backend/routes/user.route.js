import express from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
  getProfile,
  editProfile,
  getSuggestedUsers,
  searchUsers,
  followOrUnfollow,
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

// Get me
router.get("/me", isAuthenticated, getCurrentUser);

// Get user profile
router.get("/:id/profile", isAuthenticated, getProfile);

router.get("/search", isAuthenticated, searchUsers);

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
