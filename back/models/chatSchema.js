const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId:{
      type:String,
      required:true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    chatReplay: [
      {
        message: {
          type: String,
          required: true,
        },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        receiverId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
