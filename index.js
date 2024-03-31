// external imports
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const moment = require("moment");

// internal imports
const dbConnection = require("./database/dbConnection");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const loginRouter = require("./router/loginRouter");
const usersRouter = require("./router/usersRouter");
const inboxRouter = require("./router/inboxRouter");

const app = express();
const server = http.createServer(app);
dotenv.config();

// set socket globally
const io = require("socket.io")(server);
global.io = io;

// set moment as app locals
app.locals.moment = moment;

// database connection
dbConnection();

// requests parse
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine ejs
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// cookie parse
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing setup
app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// 404 not found handler
app.use(notFoundHandler);

// default error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
