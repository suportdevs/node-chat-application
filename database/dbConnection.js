const mongoose = require("mongoose");

async function dbConnection() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Database connection successfull");
    })
    .catch((err) => {
      console.log(`Database error ${err}`);
    });
}

module.exports = dbConnection;
