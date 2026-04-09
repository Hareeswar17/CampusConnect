import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

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

    let user = await User.findOne({ clerkId: clerkUserId }).select("-password");

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
        } catch (clerkError) {
          console.log("Error fetching user from Clerk API:", clerkError.message);
        }
      }

      if (!email) {
        return res.status(400).json({
          message: "Could not resolve account email from Clerk yet. Please retry in a moment.",
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        existingUser.clerkId = clerkUserId;
        if (!existingUser.fullName || existingUser.fullName === "User") {
          existingUser.fullName = fullName;
        }
        if (!existingUser.profilePic && profilePic) {
          existingUser.profilePic = profilePic;
        }
        await existingUser.save();
        user = await User.findById(existingUser._id).select("-password");
      }

      if (!user) {
        const createdUser = await User.create({
          clerkId: clerkUserId,
          email,
          fullName,
          password: null,
          profilePic,
        });
        user = await User.findById(createdUser._id).select("-password");
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
