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
    status: { type: String },
    onlineStatus: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
    lastSeen: { type: Date, default: null },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    address: { type: String },
    blockable: [
      {
        id: { type: mongoose.Types.ObjectId },
        name: { type: String },
        avatar: { type: String },
        blockedAt: { type: Date, default: Date.now() },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      id: { type: mongoose.Types.ObjectId },
      name: { type: String },
    },
  },
  { timestamps: true }
);

// Method to unblock a user
peopleSchema.methods.unblockUser = function (userIdToBlock) {
  this.blockable = this.blockable.filter(
    (blockedUser) => blockedUser.id.toString() !== userIdToBlock.toString()
  );
  return this.save();
};

const People = mongoose.model("People", peopleSchema);

module.exports = People;
