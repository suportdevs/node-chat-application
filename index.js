// external imports
const express = require("express");
const dotEnv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const http = require("http");

// internal imports
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const dbConnection = require("./database/dbConnection");
const authRouter = require("./routes/authRouter");
const inboxRouter = require("./routes/inboxRouter");
const userRouter = require("./routes/userRouter");
const User = require("./models/People");

const app = express();
const server = http.createServer(app);
dotEnv.config();

const io = require("socket.io")(server);
global.io = io;

// Database connection
dbConnection();

// request parse
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// Must be declared outside io.on()
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("user-connected", (userId) => {
    // Update or insert user socket
    onlineUsers.set(userId, socket.id);
    // Broadcast updated online user IDs
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    // Find and remove disconnected socket
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    // Broadcast updated online users
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  /* --- SIGNALING for WebRTC --- */

  // Caller wants to call targetUserId
  socket.on("call-user", ({ from, to, offer /* sdp offer */ }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", { from, offer });
    } else {
      // target offline - inform caller
      socket.emit("user-unavailable", { to });
    }
  });

  // Callee sends answer back
  socket.on("make-answer", ({ to, answer }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-accepted", { answer });
    }
  });

  // Exchanging ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    }
  });

  // Caller cancels or hangup
  socket.on("end-call", ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended");
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

// server.listen(process.env.PORT, () => {
//   console.log(`Application listen to port ${process.env.PORT}`);
// });
