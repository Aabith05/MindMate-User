import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Chat from "./models/Chat.model.js";
import auth from "./middleware/auth.js";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import gamesrouter from "./routes/games.route.js";
import authrouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import caretakerRouter from "./routes/caretaker.route.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.get("/", (req, res) => res.send("Server is up and running!"));
app.use("/api/games", gamesrouter);
app.use("/api/auth", authrouter);
app.use("/api/chat", auth, chatRouter);
app.use("/api/caretaker",caretakerRouter);

// Socket.IO auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.userId);

  socket.join(socket.userId);

  socket.on("send_message", async ({ receiver, message }) => {
    if (!receiver || !message) return;

    const chat = await Chat.create({
      sender: socket.userId,
      receiver,
      message,
    });

    // emit to both sender and receiver
    io.to(receiver).emit("receive_message", chat);
    io.to(socket.userId).emit("receive_message", chat);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.userId);
  });
});

connectDB();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);
