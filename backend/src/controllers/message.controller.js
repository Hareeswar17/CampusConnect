import cloudinary from "../lib/cloudinary.js";
import { createClerkClient } from "@clerk/backend";
import { ENV } from "../lib/env.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const hasObjectId = (list, id) => list.some((item) => item.toString() === id.toString());
const clerkClient = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });

const deriveFullNameFromClerkUser = (clerkUser) => {
  const fullName = clerkUser?.fullName?.trim();
  if (fullName) return fullName;

  const joinedName = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim();
  if (joinedName) return joinedName;

  if (clerkUser?.username) return clerkUser.username;

  const primaryEmailId = clerkUser?.primaryEmailAddressId;
  const emailFromPrimary = clerkUser?.emailAddresses?.find(
    (entry) => entry.id === primaryEmailId
  )?.emailAddress;
  const email = emailFromPrimary || clerkUser?.emailAddresses?.[0]?.emailAddress || "";
  const usernameFromEmail = email.split("@")[0]?.trim();

  return usernameFromEmail || null;
};

const enrichUserNameFromClerk = async (userDoc) => {
  const user = userDoc?.toObject ? userDoc.toObject() : userDoc;
  if (!user) return user;

  const hasGoodName = user.fullName && user.fullName.trim().toLowerCase() !== "user";
  if (hasGoodName || !user.clerkId) {
    return user;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(user.clerkId);
    const resolvedName = deriveFullNameFromClerkUser(clerkUser);

    if (!resolvedName) {
      return user;
    }

    const resolvedProfilePic = clerkUser?.imageUrl || user.profilePic || "";

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          fullName: resolvedName,
          profilePic: resolvedProfilePic,
        },
      }
    );

    return {
      ...user,
      fullName: resolvedName,
      profilePic: resolvedProfilePic,
    };
  } catch {
    return user;
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const currentUser = await User.findById(loggedInUserId).select("friends");
    const contacts = await User.find({ _id: { $in: currentUser?.friends || [] } }).select(
      "-password"
    );

    res.status(200).json(contacts);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDiscoverUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const rawQuery = (req.query.q || "").toString().trim();
    const currentUser = await User.findById(loggedInUserId).select(
      "friends incomingFriendRequests outgoingFriendRequests"
    );

    const excludedIds = [
      loggedInUserId,
      ...(currentUser?.friends || []),
      ...(currentUser?.incomingFriendRequests || []),
      ...(currentUser?.outgoingFriendRequests || []),
    ];

    if (!rawQuery) {
      return res.status(200).json([]);
    }

    const searchRegex = new RegExp(rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const users = await User.find({
      _id: { $nin: excludedIds },
      $or: [{ fullName: searchRegex }, { email: searchRegex }],
    })
      .select("-password")
      .limit(25);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getDiscoverUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const currentUser = await User.findById(loggedInUserId)
      .populate("incomingFriendRequests", "_id clerkId fullName profilePic email")
      .populate("outgoingFriendRequests", "_id clerkId fullName profilePic email");

    const incoming = await Promise.all(
      (currentUser?.incomingFriendRequests || []).map(enrichUserNameFromClerk)
    );
    const outgoing = await Promise.all(
      (currentUser?.outgoingFriendRequests || []).map(enrichUserNameFromClerk)
    );

    res.status(200).json({
      incoming,
      outgoing,
    });
  } catch (error) {
    console.log("Error in getFriendRequests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!receiver) {
      return res.status(404).json({ message: "User not found." });
    }

    if (hasObjectId(sender.friends, receiverId)) {
      return res.status(400).json({ message: "Already friends." });
    }

    if (hasObjectId(sender.outgoingFriendRequests, receiverId)) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    if (hasObjectId(sender.incomingFriendRequests, receiverId)) {
      return res.status(400).json({
        message: "This user already sent you a request. Check requests tab.",
      });
    }

    sender.outgoingFriendRequests.push(receiver._id);
    receiver.incomingFriendRequests.push(sender._id);

    await Promise.all([sender.save(), receiver.save()]);

    res.status(201).json({ message: "Friend request sent." });
  } catch (error) {
    console.log("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id: requesterId } = req.params;

    const [currentUser, requester] = await Promise.all([
      User.findById(currentUserId),
      User.findById(requesterId),
    ]);

    if (!requester) {
      return res.status(404).json({ message: "Request sender not found." });
    }

    if (!hasObjectId(currentUser.incomingFriendRequests, requesterId)) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    currentUser.incomingFriendRequests = currentUser.incomingFriendRequests.filter(
      (id) => id.toString() !== requesterId
    );
    requester.outgoingFriendRequests = requester.outgoingFriendRequests.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    if (!hasObjectId(currentUser.friends, requesterId)) {
      currentUser.friends.push(requester._id);
    }
    if (!hasObjectId(requester.friends, currentUserId)) {
      requester.friends.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), requester.save()]);
    res.status(200).json({ message: "Friend request accepted." });
  } catch (error) {
    console.log("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id: requesterId } = req.params;

    const [currentUser, requester] = await Promise.all([
      User.findById(currentUserId),
      User.findById(requesterId),
    ]);

    if (!requester) {
      return res.status(404).json({ message: "Request sender not found." });
    }

    currentUser.incomingFriendRequests = currentUser.incomingFriendRequests.filter(
      (id) => id.toString() !== requesterId
    );
    requester.outgoingFriendRequests = requester.outgoingFriendRequests.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), requester.save()]);
    res.status(200).json({ message: "Friend request rejected." });
  } catch (error) {
    console.log("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
