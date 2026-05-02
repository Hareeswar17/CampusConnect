import mongoose from "mongoose";

const groupResourceSchema = new mongoose.Schema(
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
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Lecture Slides", "Reading Materials", "Key Documents", "Syllabus"],
      required: true,
    },
    type: {
      type: String,
      default: "LINK", // PDF, DOCX, LINK, etc.
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const GroupResource = mongoose.model("GroupResource", groupResourceSchema);

export default GroupResource;
