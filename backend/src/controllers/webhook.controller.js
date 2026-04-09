import { Webhook } from "svix";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";

const getPrimaryEmail = (data) => {
  const primaryEmailId = data.primary_email_address_id;
  const emailObj = data.email_addresses?.find((entry) => entry.id === primaryEmailId);
  return emailObj?.email_address || data.email_addresses?.[0]?.email_address || null;
};

const getFullName = (data) => {
  const first = data.first_name || "";
  const last = data.last_name || "";
  const full = `${first} ${last}`.trim();
  return full || data.username || "User";
};

export const clerkWebhook = async (req, res) => {
  try {
    if (!ENV.CLERK_WEBHOOK_SECRET) {
      return res.status(500).json({ message: "CLERK_WEBHOOK_SECRET is not configured" });
    }

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ message: "Missing Svix headers" });
    }

    const wh = new Webhook(ENV.CLERK_WEBHOOK_SECRET);
    const payload = req.body?.toString("utf8");

    let event;
    try {
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (error) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const eventType = event.type;
    const data = event.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkId = data.id;
      const email = getPrimaryEmail(data);
      const fullName = getFullName(data);
      const profilePic = data.image_url || "";

      if (!clerkId) {
        return res.status(400).json({ message: "Missing Clerk user id" });
      }

      const existingByClerkId = await User.findOne({ clerkId });
      if (existingByClerkId) {
        existingByClerkId.email = email || existingByClerkId.email;
        existingByClerkId.fullName = fullName || existingByClerkId.fullName;
        existingByClerkId.profilePic = profilePic || existingByClerkId.profilePic;
        await existingByClerkId.save();
        return res.status(200).json({ ok: true });
      }

      if (!email) {
        return res.status(200).json({ ok: true, ignored: "missing_email" });
      }

      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        existingByEmail.clerkId = clerkId;
        existingByEmail.fullName = fullName || existingByEmail.fullName;
        existingByEmail.profilePic = profilePic || existingByEmail.profilePic;
        await existingByEmail.save();
        return res.status(200).json({ ok: true });
      }

      await User.create({
        clerkId,
        email,
        fullName,
        password: null,
        profilePic,
      });

      return res.status(201).json({ ok: true });
    }

    if (eventType === "user.deleted") {
      const clerkId = data.id;
      if (!clerkId) {
        return res.status(200).json({ ok: true });
      }
      await User.findOneAndDelete({ clerkId });
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true, ignored: true });
  } catch (error) {
    console.log("Error in Clerk webhook handler:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
