//external imports
const mongoose = require("mongoose");

const conversionSchema = mongoose.Schema(
  {
    creator: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
    },
    participant: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
    },
    last_update: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Conversion = mongoose.model("Conversion", conversionSchema);

module.exports = Conversion;
