const { Schema, model } = require("mongoose");

const ChatSchema = new Schema({
  friendshipId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("Chats", ChatSchema);
