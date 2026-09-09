import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./utils/db.js";

import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

// ==================== CORS ====================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// ==================== BODY PARSERS ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== ROUTES ====================

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// ==================== SOCKET.IO ====================

const { server } = initializeSocket(app);

// ==================== DATABASE ====================

connectDB();

// ==================== START SERVER ====================

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
