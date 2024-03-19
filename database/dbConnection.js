const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnection() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Database connection successfull."))
    .catch((error) => console.log(`Database connection failed ${error}`));
}

module.exports = dbConnection;
