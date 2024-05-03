const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    text: { type: String },
    attachments: [{ type: String }],
    sender: {
      id: { type: mongoose.Types.ObjectId },
      name: { type: String },
      avatar: { type: String },
    },
    receiver: {
      id: { type: mongoose.Types.ObjectId },
      name: { type: String },
      avatar: { type: String },
    },
    date_itme: { type: Date, default: Date.now() },
    conversation_id: { type: mongoose.Types.ObjectId },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
