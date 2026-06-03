import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import {
  getCachedClerkProfile,
  getCachedUserByClerkId,
  getCachedUserByEmail,
  setCachedClerkProfile,
  setCachedUser,
} from "../lib/authCache.js";

const clerkClient = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });

const getEmailFromClaims = (claims) => {
  return (
    claims?.email ||
    claims?.email_address ||
    claims?.primary_email_address ||
    claims?.primaryEmailAddress ||
    null
  );
};

const getFullNameFromClaims = (claims) => {
  const directName = claims?.full_name || claims?.fullName;
  if (directName) return directName;

  const firstName = claims?.given_name || claims?.first_name || "";
  const lastName = claims?.family_name || claims?.last_name || "";
  const derivedName = `${firstName} ${lastName}`.trim();
  return derivedName || "User";
};

const getProfileFromClerkApi = async (clerkUserId) => {
  if (!clerkUserId) return { email: null, fullName: "User", profilePic: "" };

  const cachedProfile = await getCachedClerkProfile(clerkUserId);
  if (cachedProfile) {
    return cachedProfile;
  }

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const primaryEmailId = clerkUser.primaryEmailAddressId;
  const emailFromPrimary = clerkUser.emailAddresses?.find(
    (entry) => entry.id === primaryEmailId
  )?.emailAddress;
  const email = emailFromPrimary || clerkUser.emailAddresses?.[0]?.emailAddress || null;
  const fullName =
    clerkUser.fullName ||
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
    clerkUser.username ||
    "User";

  return {
    email,
    fullName,
    profilePic: clerkUser.imageUrl || "",
  };
};

export const protectRoute = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized - No Clerk session" });
    }

    let user = await getCachedUserByClerkId(clerkUserId);

    if (!user) {
      user = await User.findOne({ clerkId: clerkUserId })
        .select("-password -teacherVerification.codeHash")
        .lean();

      if (user) {
        await setCachedUser(user);
      }
    }

    if (!user) {
      let email = getEmailFromClaims(auth.sessionClaims);
      let fullName = getFullNameFromClaims(auth.sessionClaims);
      let profilePic = "";

      if (!email || fullName === "User") {
        try {
          const clerkProfile = await getProfileFromClerkApi(clerkUserId);
          email = email || clerkProfile.email;
          fullName = fullName === "User" ? clerkProfile.fullName : fullName;
          profilePic = clerkProfile.profilePic;
          await setCachedClerkProfile(clerkUserId, clerkProfile);
        } catch (clerkError) {
          console.log("Error fetching user from Clerk API:", clerkError.message);
        }
      }

      if (!email) {
        return res.status(400).json({
          message: "Could not resolve account email from Clerk yet. Please retry in a moment.",
        });
      }

      const cachedExistingUser = await getCachedUserByEmail(email);
      const existingUser = cachedExistingUser
        ? await User.findById(cachedExistingUser._id)
        : await User.findOne({ email });

      if (existingUser) {
        existingUser.clerkId = clerkUserId;
        if (!existingUser.fullName || existingUser.fullName === "User") {
          existingUser.fullName = fullName;
        }
        if (!existingUser.profilePic && profilePic) {
          existingUser.profilePic = profilePic;
        }
        await existingUser.save();
        user = await User.findById(existingUser._id)
          .select("-password -teacherVerification.codeHash")
          .lean();
        await setCachedUser(user);
      }

      if (!user) {
        const createdUser = await User.create({
          clerkId: clerkUserId,
          email,
          fullName,
          password: null,
          profilePic,
        });
        user = await User.findById(createdUser._id)
          .select("-password -teacherVerification.codeHash")
          .lean();
        await setCachedUser(user);
      }
    }

    req.user = user;
    req.auth = auth;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import Group from "../models/Group.js";
import mongoose from "mongoose";

export const requireTeacher = async (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required" });
  }

  const { groupId } = req.params;
  if (groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }
    try {
      // Check if group is already fetched by another middleware
      const group = req.group || await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      const isGroupTeacher = group.teachers.some(
        (id) => id.toString() === req.user._id.toString()
      );

      if (!isGroupTeacher) {
        return res.status(403).json({ message: "You are not an instructor for this group" });
      }
      req.group = group;
    } catch (error) {
      return res.status(500).json({ message: "Server error verifying group teacher" });
    }
  }

  next();
};

export const requireGroupMember = async (req, res, next) => {
  const { groupId } = req.params;
  if (!groupId) return next();
  
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  try {
    const group = req.group || await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (id) => id.toString() === req.user._id.toString()
    );
    const isTeacher = group.teachers.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isMember && !isTeacher) {
      // We allow non-members to view the group basic details (getGroup) before joining, 
      // but maybe not for sub-resources. Let's pass if it's the root GET or JOIN.
      if (req.path === '/' && req.method === 'GET') {
        req.group = group;
        return next();
      }
      if (req.path === '/join' && req.method === 'POST') {
        req.group = group;
        return next();
      }
      return res.status(403).json({ message: "You are not a member of this group" });
    }
    
    req.group = group;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error verifying group member" });
  }
};
