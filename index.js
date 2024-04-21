// external imports
const express = require("express");
const dotEnv = require("dotenv");
const path = require("path");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();
dotEnv.config();

// request parse
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", (req, res) => {
//   res.send("Hello word");
// });

// not found handler
app.use(notFoundHandler);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Application listen to port ${process.env.PORT}`);
});
