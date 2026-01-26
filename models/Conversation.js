const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    creator: {
      id: { type: mongoose.Types.ObjectId },
      name: { type: String },
      avatar: { type: String },
    },
    participant: {
      id: { type: mongoose.Types.ObjectId },
      name: { type: String },
      avatar: { type: String },
    },
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    avatar: { type: String },
    members: [
      {
        id: { type: mongoose.Types.ObjectId },
        name: { type: String },
        avatar: { type: String },
      },
    ],
    admins: [{ type: mongoose.Types.ObjectId }],
    createdBy: {
      id: { type: mongoose.Types.ObjectId },
      name: { type: String },
      avatar: { type: String },
    },
    last_updated: { type: Date, default: Date.now() },
    message: {
      id: { type: mongoose.Types.ObjectId },
      content: { type: String, default: "Your are joining this conversation." },
      date_time: { type: Date, default: Date.now() },
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
