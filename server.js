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
app.use(express.json());
app.use(cookieParser());



// --- Express CORS middleware ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://darasa-six.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  })
);


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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

// --- Socket.IO events ---
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

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

  // --- CHAT EVENTS ---
  socket.on("setup", (userdata) => {
    socket.join(userdata._id);
    socket.emit("connected");
  });

  socket.on("JOIN_CHAT", (chatid) => {
    socket.join(chatid);
    console.log(`User joined chat ${chatid}`);
  });

  socket.on("typing", (chatid) => socket.in(chatid).emit("typing"));
  socket.on("stop typing", (chatid) => socket.in(chatid).emit("stop typing"));

  // --- DISCONNECT ---
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  socket.on("disconnecting", () => console.log("Disconnecting:", socket.id));
});

// --- Start server ---
const myport = process.env.PORT || 4000;
server.listen(myport, () => console.log(`Listening on port ${myport}`));
