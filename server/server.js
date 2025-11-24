const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/interview", require("./routes/interview"));
app.use("/api/learning", require("./routes/learning"));

app.get("/", (req, res) => {
  res.send("SkillForge API is running");
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_interview", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("send_message", (data) => {
    // data: { room, message, sender }
    io.to(data.room).emit("receive_message", data);

    // The AI response logic will now be handled by the client triggering an API call
    // or we can keep a simple fallback here, but for RAG we want the client to call the endpoint
    // to get the evaluated response and next question.
    // For now, let's keep the socket just for real-time message passing if we were doing peer-to-peer,
    // but for AI, we might just use the API.
    // However, to keep the "chat" feel, we can emit events from the controller too if we passed the socket instance.
    // For simplicity in this iteration, let's let the client handle the flow:
    // User sends message -> Socket emits to room (display) -> Client calls API to get AI response -> Client emits AI response to room (display)
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
