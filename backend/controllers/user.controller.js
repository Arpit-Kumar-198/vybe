import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io, emitPostUpdate } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

// ==================== REGISTER ====================

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== LOGIN ====================

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const user = await User.findOne({
      $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
    });

    if (!user) {
      return res.status(401).json({
        message: "Incorrect username/email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect username/email or password",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const populatedPosts = await Post.find({
      _id: { $in: user.posts },
      author: user._id,
    }).sort({ createdAt: -1 });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      gender: user.gender,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
      bookmarks: user.bookmarks,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: userData,
      });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== LOGOUT ====================

export const logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 0,
      })
      .status(200)
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET PROFILE ====================

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate("bookmarks");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== EDIT PROFILE ====================

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (gender !== undefined) {
      user.gender = gender;
    }

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);

      const cloudResponse = await cloudinary.uploader.upload(fileUri);

      user.profilePicture = cloudResponse.secure_url;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Edit profile error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== SUGGESTED USERS ====================

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: currentUser._id,
            $nin: currentUser.following,
          },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.error("Suggested users error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== SEARCH USERS ====================

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query?.trim()) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      username: {
        $regex: query.trim(),
        $options: "i",
      },
    })
      .select("username profilePicture bio")
      .limit(10);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== FOLLOW / UNFOLLOW ====================

export const followOrUnfollow = async (req, res) => {
  try {
    const currentUserId = req.id;
    const targetUserId = req.params.id;

    // Cannot follow yourself
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check whether current user is already following target user
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString(),
    );

    // ==================== UNFOLLOW ====================

    if (isFollowing) {
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $pull: { following: targetUserId } },
        ),

        User.updateOne(
          { _id: targetUserId },
          { $pull: { followers: currentUserId } },
        ),
      ]);

      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
        isFollowing: false,
      });
    }

    // ==================== FOLLOW ====================

    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        { $addToSet: { following: targetUserId } },
      ),

      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: currentUserId } },
      ),
    ]);

    // ================= FOLLOW NOTIFICATION =================

    if (!isFollowing) {
      // Get current user's details
      const user = await User.findById(currentUserId).select(
        "username profilePicture",
      );

      // Save notification in MongoDB
      const notification = await Notification.create({
        sender: currentUserId,
        receiver: targetUserId,
        type: "follow",
        message: `${user.username} started following you`,
      });

      // Send real-time notification
      const targetUserSocketId = getReceiverSocketId(targetUserId.toString());

      if (targetUserSocketId && io) {
        io.to(targetUserSocketId).emit("notification", {
          ...notification.toObject(),
          userDetails: user,
        });
      }
    }
    return res.status(200).json({
      message: "Followed successfully",
      success: true,
      isFollowing: true,
    });
  } catch (error) {
    console.error("Follow/unfollow error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET CURRENT USER ====================

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.id)
      .select("-password")
      .populate({
        path: "posts",
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate("bookmarks");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
