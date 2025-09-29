import express from "express";
import cors from "cors";
import "dotenv/config";
import Db from "./Config/Db.js";
import UserRouter from "./Routes/Userroutes.js";
import MsgRouter from "./Routes/Msgroutes.js";
import ChatRouter from "./Routes/Chatroutes.js";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

// --- Init express ---
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- Allowed origins ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://darasa-six.vercel.app"
];

// --- Connect to DB ---
Db();

// --- Routes ---
app.use("/user", UserRouter);
app.use("/msg", MsgRouter);
app.use("/chat", ChatRouter);

// --- Create HTTP server ---
const server = createServer(app);

// --- Socket.IO setup ---
export const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

// --- Online users tracker ---
let onlineUsers = {}; // { userId: socket.id }

// --- Socket.IO events ---
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // --- Setup user ---
  socket.on("setup", (user) => {
    socket.userId = user._id;
    socket.join(user._id); // join a room with their own userId
    onlineUsers[user._id] = socket.id;

    socket.emit("connected");
    io.emit("online-users", Object.keys(onlineUsers)); // broadcast online users
  });

  // --- Join a chat room ---
  socket.on("JOIN_CHAT", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // --- Typing indicators ---
  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing", { userId: socket.userId });
  });

  socket.on("stop typing", (chatId) => {
    socket.in(chatId).emit("stop typing", { userId: socket.userId });
  });

  // --- New message ---
  socket.on("new message", (message) => {
    const chatId = message.chatId;
    if (!chatId) return;

    // emit to everyone in that chat except sender
    socket.to(chatId).emit("new message", message);
  });

  // --- Disconnect ---
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    if (socket.userId) {
      delete onlineUsers[socket.userId];
    }
    io.emit("online-users", Object.keys(onlineUsers));
  });

  socket.on("disconnecting", () => {
    console.log(`Disconnecting: ${socket.userId}`);
  });

  // --- Video call events (optional) ---
  socket.on("joinroom", (roomId, userId) => {
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", { sdp: data.sdp, sender: socket.id });
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", { sdp: data.sdp, sender: socket.id });
  });

  socket.on("candidate", (data) => {
    socket.to(data.roomId).emit("candidate", { candidate: data.candidate, sender: socket.id });
  });
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
