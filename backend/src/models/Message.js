import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    audioMimeType: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    audioDurationMs: {
      type: Number,
      min: 0,
    },
    audioTranscript: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    translation: {
      mode: {
        type: String,
        enum: ["text", "voice"],
      },
      provider: {
        type: String,
        trim: true,
        maxlength: 40,
      },
      targetLanguage: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      sourceText: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
      translatedText: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
      translatedAudioUrl: {
        type: String,
      },
    },
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      text: {
        type: String,
        trim: true,
        maxlength: 400,
      },
      image: {
        type: Boolean,
        default: false,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
