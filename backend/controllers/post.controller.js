import sharp from "sharp";

import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io, emitPostUpdate } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

// ==================== CREATE POST ====================

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        message: "Image is required.",
        success: false,
      });
    }

    // Optimize image before uploading to Cloudinary
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", {
        quality: 80,
      })
      .toBuffer();

    // Convert image buffer to Data URI
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64",
    )}`;

    // Upload image to Cloudinary
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    // Create post
    const post = await Post.create({
      caption: caption || "",
      image: cloudResponse.secure_url,
      author: authorId,
    });

    // Add post ID to user's posts
    await User.findByIdAndUpdate(authorId, {
      $push: {
        posts: post._id,
      },
    });

    // Return author information with the post
    await post.populate({
      path: "author",
      select: "username profilePicture bio",
    });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.error("Add post error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET ALL POSTS ====================

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        options: {
          sort: { createdAt: -1 },
        },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.error("Get all posts error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET USER POSTS ====================

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;

    const posts = await Post.find({
      author: authorId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        options: {
          sort: { createdAt: -1 },
        },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.error("Get user posts error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== LIKE POST ====================

export const likePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await Post.updateOne(
      { _id: postId },
      {
        $addToSet: {
          likes: userId,
        },
      },
    );
    const updatedPost = await Post.findById(postId).select("likes");

    emitPostUpdate("post:liked", {
      postId,
      likes: updatedPost.likes,
    });

    // Send notification to post owner
    if (post.author.toString() !== userId.toString()) {
      const user = await User.findById(userId).select(
        "username profilePicture",
      );

      // Save notification in MongoDB
      const notification = await Notification.create({
        sender: userId,
        receiver: post.author,
        type: "like",
        post: postId,
        message: `${user.username} liked your post`,
      });

      // Send real-time notification
      const postOwnerSocketId = getReceiverSocketId(post.author.toString());

      if (postOwnerSocketId && io) {
        io.to(postOwnerSocketId).emit("notification", {
          ...notification.toObject(),
          userDetails: user,
        });
      }
    }

    return res.status(200).json({
      message: "Post liked",
      success: true,
    });
  } catch (error) {
    console.error("Like post error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== DISLIKE POST ====================

export const dislikePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await Post.updateOne(
      { _id: postId },
      {
        $pull: {
          likes: userId,
        },
      },
    );

    const updatedPost = await Post.findById(postId).select("likes");

    emitPostUpdate("post:disliked", {
      postId,
      likes: updatedPost.likes,
    });

    return res.status(200).json({
      message: "Post disliked",
      success: true,
    });
  } catch (error) {
    console.error("Dislike post error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== ADD COMMENT ====================

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        message: "Text is required",
        success: false,
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Create comment
    const comment = await Comment.create({
      text: text.trim(),
      author: userId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    // Add comment to post
    await Post.updateOne(
      { _id: postId },
      {
        $push: {
          comments: comment._id,
        },
      },
    );

    // Broadcast comment update
    emitPostUpdate("post:commented", {
      postId,
      comment,
    });

    // ================= COMMENT NOTIFICATION =================

    // Don't notify users when they comment on their own post
    if (post.author.toString() !== userId.toString()) {
      const user = await User.findById(userId).select(
        "username profilePicture",
      );

      // Save notification in MongoDB
      const notification = await Notification.create({
        sender: userId,
        receiver: post.author,
        type: comment.text,
        post: postId,
        message: `${user.username} commented on your post`,
      });

      // Send real-time notification
      const postOwnerSocketId = getReceiverSocketId(post.author.toString());

      if (postOwnerSocketId && io) {
        io.to(postOwnerSocketId).emit("notification", {
          ...notification.toObject(),
          userDetails: user,
        });
      }
    }

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.error("Add comment error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET COMMENTS ====================

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({
      post: postId,
    })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture");

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== DELETE POST ====================

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Only the owner can delete the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // Delete post
    await Post.findByIdAndDelete(postId);

    // Remove post from user's posts
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          posts: postId,
        },
      },
    );

    // Remove post from everyone's bookmarks
    await User.updateMany(
      { bookmarks: postId },
      {
        $pull: {
          bookmarks: postId,
        },
      },
    );

    // Delete comments belonging to this post
    await Comment.deleteMany({
      post: postId,
    });

    // Delete notifications related to this post
    await Notification.deleteMany({
      post: postId,
    });

    // Notify frontend that post was deleted
    emitPostUpdate("post:deleted", {
      postId,
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== BOOKMARK POST ====================

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const isBookmarked = user.bookmarks.some((id) => id.toString() === postId);

    if (isBookmarked) {
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            bookmarks: postId,
          },
        },
      );

      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    }

    await User.updateOne(
      { _id: userId },
      {
        $addToSet: {
          bookmarks: postId,
        },
      },
    );

    return res.status(200).json({
      type: "saved",
      message: "Post bookmarked",
      success: true,
    });
  } catch (error) {
    console.error("Bookmark post error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET SINGLE POST ====================

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate({
        path: "author",
        select: "username profilePicture bio",
      })
      .populate({
        path: "comments",
        options: {
          sort: { createdAt: -1 },
        },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    return res.status(200).json({
      post,
      success: true,
    });
  } catch (error) {
    console.error("Get single post error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
