import mongoose from "mongoose";

const groupDoubtCommentSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    doubtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupDoubt",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["clarification", "question"],
      default: "clarification",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      default: "",
      trim: true,
    },
    authorRole: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
  },
  { timestamps: true }
);

const GroupDoubtComment = mongoose.model("GroupDoubtComment", groupDoubtCommentSchema);

export default GroupDoubtComment;
