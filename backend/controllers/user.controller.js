import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    // Check if email OR username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists.",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check required fields
    if ((!username || !password) && (!email || !password)) {
      return res.status(400).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    // Find user by email OR username
    let user = await User.findOne({
      $or: [{ username }, { email }],
    });
    // User not found
    if (!user) {
      return res.status(401).json({
        message: "Incorrect username/email or password",
        success: false,
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect username/email or password",
        success: false,
      });
    }

    // Create JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    // Populate posts
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);

        if (post && post.author.equals(user._id)) {
          return post;
        }

        return null;
      }),
    );

    // Remove null posts
    const validPosts = populatedPosts.filter(Boolean);

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: validPosts,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate("bookmarks");
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.id);

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: user._id,
            $nin: user.following,
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
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    // ID of the currently logged-in user
    const currentUserId = req.id;

    // ID of the user we want to follow/unfollow
    const targetUserId = req.params.id;

    // A user cannot follow/unfollow themselves
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    // Find both users
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    // Check if either user does not exist
    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check whether the current user is already following the target user
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // UNFOLLOW:
      // Remove target user from current user's following list
      // Remove current user from target user's followers list
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
      });
    } else {
      // FOLLOW:
      // Add target user to current user's following list
      // Add current user to target user's followers list
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $push: { following: targetUserId } },
        ),

        User.updateOne(
          { _id: targetUserId },
          { $push: { followers: currentUserId } },
        ),
      ]);

      return res.status(200).json({
        message: "Followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
