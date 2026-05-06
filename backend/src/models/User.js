import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
    roleSelected: {
      type: Boolean,
      default: false,
    },
    teacherVerification: {
      status: {
        type: String,
        enum: ["none", "pending", "verified"],
        default: "none",
      },
      codeHash: {
        type: String,
        select: false,
        default: null,
      },
      requestedAt: {
        type: Date,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
    },
    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    incomingFriendRequests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    outgoingFriendRequests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: true } // createdAt & updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;
