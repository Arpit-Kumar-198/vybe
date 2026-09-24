import http from "http";
import { Server } from "socket.io";

let io;
let server;

const userSocketMap = {};

// Get a user's socket ID
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Broadcast post updates to all connected users
export const emitPostUpdate = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Broadcast current online users
const emitOnlineUsers = () => {
  if (io) {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
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

    if (userId) {
      userSocketMap[userId] = socket.id;

      console.log(`User connected: ${userId} | Socket: ${socket.id}`);

      emitOnlineUsers();
    }

    socket.on("disconnect", () => {
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];

        console.log(`User disconnected: ${userId} | Socket: ${socket.id}`);

        emitOnlineUsers();
      }
    });
  });

  return { server, io };
};

export { io, server };
