import mongoose from "mongoose";

const auditEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["created", "resolved"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actorName: {
      type: String,
      default: "",
      trim: true,
    },
    actorRole: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const groupDoubtSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      default: "General",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    assignedToTeacher: {
      type: Boolean,
      default: false,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["unanswered", "resolved"],
      default: "unanswered",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName: {
      type: String,
      default: "",
      trim: true,
    },
    createdByRole: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedByName: {
      type: String,
      default: "",
      trim: true,
    },
    resolvedByRole: {
      type: String,
      enum: ["student", "teacher"],
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    auditLog: {
      type: [auditEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const GroupDoubt = mongoose.model("GroupDoubt", groupDoubtSchema);

export default GroupDoubt;
