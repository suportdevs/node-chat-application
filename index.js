// external imports
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

// internal imports
const dbConnection = require("./database/dbConnection");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const loginRouter = require("./router/loginRouter");

const app = express();
dotenv.config();

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

// 404 not found handler
app.use(notFoundHandler);

// default error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
