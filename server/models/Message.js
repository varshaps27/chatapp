const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: String,
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: false },
  recipient: String
});

module.exports = mongoose.model("Message", messageSchema);
