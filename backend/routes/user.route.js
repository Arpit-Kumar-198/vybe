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
/*
route() lets you define multiple HTTP methods for the same path:
For example:
    router.route("/register")
    .post(register)
        .get(something);

The client can send one HTTP request at a time for a particular action, but the same URL can accept different types of requests.
POST /register  → run register()
GET  /register  → run something()

*/
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/:id/profile").get(isAuthenticated, getProfile);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePhoto"), editProfile);
router.route("/suggest").get(isAuthenticated, getSuggestedUsers);
router.route("/followorunfollow/:id").post(isAuthenticated, followOrUnfollow);

export default router;
