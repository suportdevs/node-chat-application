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
    last_updated: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
