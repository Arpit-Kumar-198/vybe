import { Notification } from "../models/notification.model.js";

// ==================== GET NOTIFICATIONS ====================

export const getNotifications = async (req, res) => {
  try {
    const userId = req.id;

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "username profilePicture")
      .populate("post", "image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==================== GET UNREAD COUNT ====================

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.id;

    const count = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get notification count error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==================== MARK NOTIFICATIONS AS READ ====================

export const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.id;

    await Notification.updateMany(
      {
        receiver: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Mark notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
