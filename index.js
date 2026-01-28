// external imports
const express = require("express");
const dotEnv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const http = require("http");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// internal imports
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const dbConnection = require("./database/dbConnection");
const authRouter = require("./routes/authRouter");
const inboxRouter = require("./routes/inboxRouter");
const userRouter = require("./routes/userRouter");
const User = require("./models/People");
const Conversation = require("./models/Conversation");

const app = express();
const server = http.createServer(app);
dotEnv.config();

const io = require("socket.io")(server);
global.io = io;

// Database connection
dbConnection();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// request parse
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// basic hardening
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// set view engine
app.set("view engine", "ejs");

app.locals.moment = moment;

// set static folder
app.use(express.static(path.join(__dirname, "public")));
// cookie parse
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/", authRouter);
app.use("/users", userRouter);
app.use("/inbox", inboxRouter);

app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});
// Must be declared outside io.on()
// Map<userId, Set<socketId>>
const onlineUsers = new Map();

function getAnySocketId(userId) {
  const sockets = onlineUsers.get(userId);
  if (!sockets || sockets.size === 0) return null;
  return sockets.values().next().value;
}

function emitToUserIds(userIds, event, payload) {
  userIds.forEach((userId) => {
    const socketId = getAnySocketId(userId);
    if (socketId) {
      io.to(socketId).emit(event, payload);
    }
  });
}

io.on("connection", (socket) => {
  socket.on("user-connected", async (userId) => {
    socket.data.userId = userId;
    const sockets = onlineUsers.get(userId) || new Set();
    sockets.add(socket.id);
    onlineUsers.set(userId, sockets);

    try {
      await User.findByIdAndUpdate(
        userId,
        { onlineStatus: "Online", lastSeen: new Date() },
        { new: false }
      );
    } catch (err) {
      console.error("Online status update failed", err);
    }

    // Broadcast updated online user IDs
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", async () => {
    const userId = socket.data.userId;
    if (userId) {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          try {
            await User.findByIdAndUpdate(
              userId,
              { onlineStatus: "Offline", lastSeen: new Date() },
              { new: false }
            );
          } catch (err) {
            console.error("Offline status update failed", err);
          }
        } else {
          onlineUsers.set(userId, sockets);
        }
      }
    }
    // Broadcast updated online users
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  /* --- SIGNALING for WebRTC --- */

  // Caller wants to call targetUserId
  socket.on("call-user", ({ from, to, offer, callType /* sdp offer */ }) => {
    const targetSocketId = getAnySocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", { from, offer, callType });
    } else {
      // target offline - inform caller
      socket.emit("user-unavailable", { to });
    }
  });

  // Callee sends answer back
  socket.on("make-answer", ({ to, answer }) => {
    const targetSocketId = getAnySocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-accepted", { answer });
    }
  });

  // Exchanging ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = getAnySocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    }
  });

  // Caller cancels or hangup
  socket.on("end-call", ({ to, from }) => {
    const targetSocketId = getAnySocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended", { from });
    }
  });

  // Callee rejects a call
  socket.on("reject-call", ({ to, from }) => {
    const targetSocketId = getAnySocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-rejected", { from });
    }
  });

  // Callee is busy
  socket.on("call-busy", ({ to, from }) => {
    const targetSocketId = getAnySocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-busy", { from });
    }
  });

  socket.on("typing", async ({ conversationId, senderId, senderName }) => {
    if (!conversationId || !senderId) return;
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
      let targetIds = [];
      if (conversation.isGroup) {
        targetIds = (conversation.members || [])
          .map((member) => member.id?.toString())
          .filter((id) => id && id !== senderId.toString());
      } else {
        const creatorId = conversation.creator?.id?.toString();
        const participantId = conversation.participant?.id?.toString();
        const otherId =
          creatorId === senderId.toString() ? participantId : creatorId;
        if (otherId) targetIds = [otherId];
      }
      emitToUserIds(targetIds, "typing", {
        conversationId,
        senderId,
        senderName,
        isGroup: conversation.isGroup,
      });
    } catch (err) {
      console.error("Typing event failed", err);
    }
  });

  socket.on("stop-typing", async ({ conversationId, senderId, senderName }) => {
    if (!conversationId || !senderId) return;
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
      let targetIds = [];
      if (conversation.isGroup) {
        targetIds = (conversation.members || [])
          .map((member) => member.id?.toString())
          .filter((id) => id && id !== senderId.toString());
      } else {
        const creatorId = conversation.creator?.id?.toString();
        const participantId = conversation.participant?.id?.toString();
        const otherId =
          creatorId === senderId.toString() ? participantId : creatorId;
        if (otherId) targetIds = [otherId];
      }
      emitToUserIds(targetIds, "stop-typing", {
        conversationId,
        senderId,
        senderName,
        isGroup: conversation.isGroup,
      });
    } catch (err) {
      console.error("Stop typing event failed", err);
    }
  });
});

// not found handler
app.use(notFoundHandler);

// defauld error handler
app.use(errorHandler);

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// server.listen(process.env.PORT, () => {
//   console.log(`Application listen to port ${process.env.PORT}`);
// });
