const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
  },
  senderEmail: {
      type: String,
      required: true,
  },
  conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
  },
  content: {
      type: String,
      required: true,
  },
  timestamp: {
      type: Date,
      default: Date.now,
  },
});

const conversationModel = mongoose.Schema(
  {
    conversationName: { type: String, trim: true },
    isGroup: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: messageSchema,
    messages: [messageSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationModel);

module.exports = Conversation;