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

io.on("user_online", async (userId) => {
  io.user_id = userId;
  const user = await User.findOne({ _id: userId });
  user.onlineStatus = "Online";
  user.lastSeen = new Date();
  await user.save();
  io.emit("user_status", {
    userId,
    onlineStatus: "Online",
    lastSeen: user.lastSeen,
  });
  console.log(`${user.name}  user connected.`);
});

io.on("disconnect", async () => {
  const userId = io.userId;
  if (userId) {
    const user = await User.findOne({ _id: userId });
    if (user) {
      user.lastSeen = new Date();
      user.onlineStatus = "Offline";
      await user.save();
      io.emit("user_status", {
        userId,
        onlineStatus: "Offline",
        lastSeen: user.lastSeen,
      });
    }
  }
  console.log("A user disconnect.");
});

// not found handler
app.use(notFoundHandler);

// defauld error handler
app.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
