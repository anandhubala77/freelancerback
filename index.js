// 1) import dotenv
require("dotenv").config();

// 2) import express
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// 3) import DB connection
require("./DB/connection");

// 4) import cors
const cors = require("cors");

// 5) import router
const router = require("./routes/router");
const quotationRoutes = require("./routes/quotationRoutes");
const applicationRoute = require("./routes/applicationRoute");
const paymentRoute = require("./routes/paymentRoute");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoute = require("./routes/notificationRoute");
const chatRoutes = require("./routes/chatRoutes");

// models for socket auth checks
const Project = require("./models/projectSchema");
const Quotation = require("./models/quotationSchema");
// 6) create express server
const pfServer = express();
const server = http.createServer(pfServer);

// 7) use cors in pfServer
pfServer.use(cors());

// 8) use middleware to parse JSON
pfServer.use(express.json());
pfServer.use(express.urlencoded({ extended: true }));

// 9) use the router
pfServer.use("/", router);

pfServer.use("/", quotationRoutes);
pfServer.use("/", applicationRoute);
pfServer.use("/", paymentRoute);
pfServer.use("/admin", adminRoutes);

pfServer.use("/notifications", notificationRoute);
pfServer.use("/chat", chatRoutes);


//image upload

pfServer.use("/uploads", express.static("uploads")); 

// 10) define PORT
const PORT = process.env.PORT || 5000;

// 12) Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// helper: check if user can access project chat
async function canAccessProjectChat(userId, projectId) {
  const project = await Project.findById(projectId).select("userId");
  if (!project) return false;
  if (project.userId.toString() === userId.toString()) {
    const hasAccepted = await Quotation.exists({ jobId: projectId, status: "accepted" });
    return !!hasAccepted;
  }
  const accepted = await Quotation.exists({ jobId: projectId, userId, status: "accepted" });
  return !!accepted;
}

io.use((socket, next) => {
  // attach token and user info if needed; rely on client providing { userId, token }
  const { userId } = socket.handshake.auth || {};
  if (!userId) return next(new Error("unauthorized"));
  socket.userId = userId;
  next();
});

io.on("connection", (socket) => {
  // join a project room if authorized
  socket.on("chat:join", async ({ projectId }) => {
    try {
      if (!projectId) return;
      const ok = await canAccessProjectChat(socket.userId, projectId);
      if (!ok) return;
      socket.join(`project:${projectId}`);
    } catch (e) {
      console.error("chat:join error", e);
    }
  });

  socket.on("disconnect", () => {});
});

// expose io to routes/controllers
pfServer.set("io", io);

// 11) run the server
server.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
});
