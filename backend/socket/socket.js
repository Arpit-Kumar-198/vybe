import http from "http";
import { Server } from "socket.io";

let io;
let server;

const userSocketMap = {};

// Get a user's socket ID
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Initialize Socket.IO
export const initializeSocket = (app) => {
  server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    // Store user's socket ID
    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    // Send current online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // User disconnected
    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];
      }

      // Send updated online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return { server, io };
};

export { io, server };
