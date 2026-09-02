import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import { server } from "./socket/socket.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// This tells Express to understand form data sent from the browser.
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

// APIs
app.use("/api/v1/user", userRoute);

const PORT = process.env.PORT;

connectDB();
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
