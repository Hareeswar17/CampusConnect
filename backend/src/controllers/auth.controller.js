import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

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
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
