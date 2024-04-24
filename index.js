// external imports
const express = require("express");
const dotEnv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

// internal imports
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const dbConnection = require("./database/dbConnection");
const authRouter = require("./routes/authRouter");
const inboxRouter = require("./routes/inboxRouter");

const app = express();
dotEnv.config();

// Database connection
dbConnection();

// request parse
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));
// cookie parse
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/", authRouter);
// app.use('/users', userRouter);
app.use("/inbox", inboxRouter);

// not found handler
app.use(notFoundHandler);

// defauld error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
