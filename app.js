// enternal imports
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

// internal imports
const {
  notFoundHandler,
  defaultErrorHandler,
} = require("./middlewares/common/notFoundHandler");

const app = express();
dotenv.config();

// database connection
mongoose
  .connect(process.env.DATABASE_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful."))
  .catch((err) => console.log(err));

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view-engine", "ejs");

// set static folders
app.use(express.static(path.join(__dirname, "public")));

// cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// router configuration

// not found error handler
app.use(notFoundHandler);

// common error handler
app.use(defaultErrorHandler);

app.listen(process.env.PORT, () => {
  console.log("App listen to port" + process.env.PORT);
});
