const mongoose = require("mongoose");

async function dbConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Database connection successfull.");
  } catch (err) {
    console.error(`Database error ${err}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

module.exports = dbConnection;
