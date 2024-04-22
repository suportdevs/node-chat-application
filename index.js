// external imports
const express = require("express");
const dotEnv = require("dotenv");
const path = require("path");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const dbConnection = require("./database/dbConnection");

// internal imports
const loginRouter = require("./routes/loginRouter");
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

app.use("/", loginRouter);
// app.use('/users', userRouter);
app.use("/inbox", inboxRouter);

// not found handler
app.use(notFoundHandler);

// defauld error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
