const mongoose = require("mongoose");

const peopleSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowerCase: true,
      trim: true,
    },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    blockable: [
      {
        id: { type: mongoose.Types.ObjectId },
        name: { type: String },
        avatar: { type: String },
        blockedAt: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true }
);

const People = mongoose.model("People", peopleSchema);

module.exports = People;
