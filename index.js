const express = require("express");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");
const dbConnection = require("./database/dbConnection");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

// database connection
dbConnection();

// requests parse
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine ejs
app.set("view engine", ejs);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// cookie parse
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing setup

// error handling

app.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
