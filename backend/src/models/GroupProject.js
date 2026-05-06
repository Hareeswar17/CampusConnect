import mongoose from "mongoose";

const groupProjectSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["Team", "Individual"],
      default: "Team",
    },
    maxMembers: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const GroupProject = mongoose.model("GroupProject", groupProjectSchema);

export default GroupProject;
