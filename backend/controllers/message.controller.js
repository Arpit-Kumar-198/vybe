import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// ==================== SEND MESSAGE ====================

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage } = req.body;

    const message = textMessage?.trim();

    if (!message) {
      return res.status(400).json({
        message: "Message cannot be empty.",
        success: false,
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    // Add message to conversation
    conversation.messages.push(newMessage._id);

    await conversation.save();

    // Send message in real time if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ==================== GET MESSAGES ====================

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    }).populate("messages");

    // No conversation means no messages yet
    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
