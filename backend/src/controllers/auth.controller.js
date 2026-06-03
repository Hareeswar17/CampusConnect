import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { ENV } from "../lib/env.js";
import { setCachedUser } from "../lib/authCache.js";

export const signup = async (_, res) =>
  res.status(410).json({ message: "Signup is handled by Clerk" });

export const login = async (_, res) =>
  res.status(410).json({ message: "Login is handled by Clerk" });

export const logout = (_, res) => {
  res.status(200).json({ message: "Logout is handled by Clerk" });
};

export const checkAuth = (req, res) => {
  res.status(200).json(req.user);
};

export const setUserRole = async (req, res) => {
  try {
    const { role, inviteCode } = req.body;
    if (!role || !["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Role must be student or teacher." });
    }

    const userId = req.user._id;

    // Student role — no verification needed
    if (role === "student") {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: "student",
          roleSelected: true,
          teacherVerification: {
            status: "none",
            codeHash: null,
            requestedAt: null,
            expiresAt: null,
            verifiedAt: null,
          },
        },
        { new: true }
      )
        .select("-password -teacherVerification.codeHash")
        .lean();

      await setCachedUser(updatedUser);

      return res.status(200).json(updatedUser);
    }

    // Teacher role — already a teacher, just mark roleSelected
    if (req.user.role === "teacher") {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { roleSelected: true },
        { new: true }
      )
        .select("-password -teacherVerification.codeHash")
        .lean();
      await setCachedUser(updatedUser);
      return res.status(200).json(updatedUser);
    }

    // Teacher role — verify invite code
    const expectedCode = ENV.TEACHER_INVITE_CODE;
    if (!inviteCode || inviteCode.trim() !== expectedCode) {
      return res.status(403).json({ message: "Invalid invite code." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role: "teacher",
        roleSelected: true,
        teacherVerification: {
          status: "verified",
          codeHash: null,
          requestedAt: null,
          expiresAt: null,
          verifiedAt: new Date(),
        },
      },
      { new: true }
    )
      .select("-password -teacherVerification.codeHash")
      .lean();

    await setCachedUser(updatedUser);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in set user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    setCachedUser(updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
