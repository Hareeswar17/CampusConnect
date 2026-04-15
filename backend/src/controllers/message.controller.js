import cloudinary from "../lib/cloudinary.js";
import { randomUUID } from "node:crypto";
import { createClerkClient } from "@clerk/backend";
import { ENV } from "../lib/env.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const hasObjectId = (list, id) => list.some((item) => item.toString() === id.toString());
const clerkClient = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });

const AZURE_READY =
  Boolean(ENV.AZURE_TRANSLATOR_KEY) &&
  Boolean(ENV.AZURE_TRANSLATOR_ENDPOINT) &&
  Boolean(ENV.AZURE_TRANSLATOR_REGION) &&
  Boolean(ENV.AZURE_SPEECH_KEY) &&
  Boolean(ENV.AZURE_SPEECH_REGION);

const TTS_PROFILE_BY_LANGUAGE = {
  en: { voiceName: "en-GB-SoniaNeural", locale: "en-GB" },
  es: { voiceName: "es-ES-ElviraNeural", locale: "es-ES" },
  fr: { voiceName: "fr-FR-DeniseNeural", locale: "fr-FR" },
  de: { voiceName: "de-DE-KatjaNeural", locale: "de-DE" },
  hi: { voiceName: "hi-IN-SwaraNeural", locale: "hi-IN" },
  mr: { voiceName: "mr-IN-AarohiNeural", locale: "mr-IN" },
};

const DEFAULT_TTS_PROFILE = {
  // Multilingual fallback keeps voice output available for languages
  // that don't have a dedicated mapping in this app yet.
  voiceName: "en-US-AvaMultilingualNeural",
  locale: "en-US",
};

const getTtsProfile = (targetLanguage) =>
  TTS_PROFILE_BY_LANGUAGE[targetLanguage] || DEFAULT_TTS_PROFILE;

const normalizeTranslatorEndpoint = (endpoint) => endpoint.replace(/\/+$/, "");

const translateWithAzure = async ({ text, targetLanguage }) => {
  const endpoint = normalizeTranslatorEndpoint(ENV.AZURE_TRANSLATOR_ENDPOINT);
  const url = `${endpoint}/translate?api-version=3.0&to=${encodeURIComponent(targetLanguage)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": ENV.AZURE_TRANSLATOR_KEY,
      "Ocp-Apim-Subscription-Region": ENV.AZURE_TRANSLATOR_REGION,
      "Content-Type": "application/json",
      "X-ClientTraceId": randomUUID(),
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure translator failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data?.[0]?.translations?.[0]?.text || "";
};

const synthesizeSpeechWithAzure = async ({ text, targetLanguage }) => {
  const profile = getTtsProfile(targetLanguage);
  const ttsEndpoint = `https://${ENV.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const ssml = `<speak version='1.0' xml:lang='${profile.locale}'><voice xml:lang='${profile.locale}' name='${profile.voiceName}'>${escapedText}</voice></speak>`;

  const response = await fetch(ttsEndpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": ENV.AZURE_SPEECH_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
      "User-Agent": "CampusConnect",
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure speech failed: ${response.status} ${errorBody}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
};

const normalizeAudioDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return dataUrl;
  }

  const [prefix, payload] = dataUrl.split(",", 2);
  if (!prefix || !payload) {
    return dataUrl;
  }

  // Cloudinary may reject codec-qualified mime types in data URI metadata.
  const normalizedPrefix = prefix.replace(/;codecs=[^;]+/gi, "");
  return `${normalizedPrefix},${payload}`;
};

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

    const unreadIncomingMessages = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      isRead: { $ne: true },
    }).select("_id");

    if (unreadIncomingMessages.length > 0) {
      const unreadMessageIds = unreadIncomingMessages.map((msg) => msg._id);

      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        {
          $set: { isRead: true },
        }
      );

      const senderSocketId = getReceiverSocketId(userToChatId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          readerId: myId.toString(),
          messageIds: unreadMessageIds.map((id) => id.toString()),
        });
      }
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const {
      text,
      image,
      audio,
      audioMimeType,
      audioDurationMs,
      audioTranscript,
      translation,
      replyTo,
      isForwarded,
    } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !audio) {
      return res.status(400).json({ message: "Text, image or audio is required." });
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

    let audioUrl;
    if (audio) {
      const normalizedAudio = normalizeAudioDataUrl(audio);
      const uploadResponse = await cloudinary.uploader.upload(normalizedAudio, {
        resource_type: "video",
        folder: "chat-audio",
      });
      audioUrl = uploadResponse.secure_url;
    }

    let translatedAudioUrl;
    if (translation?.mode === "voice") {
      let translatedAudioDataUrl = translation?.translatedAudio;

      if (!translatedAudioDataUrl && AZURE_READY) {
        const textForSpeech =
          (translation?.translatedText || "").toString().trim() ||
          (translation?.sourceText || "").toString().trim();
        const targetLang = (translation?.targetLanguage || "en").toString().trim();

        if (textForSpeech) {
          translatedAudioDataUrl = await synthesizeSpeechWithAzure({
            text: textForSpeech,
            targetLanguage: targetLang,
          });
        }
      }

      if (translatedAudioDataUrl) {
        const translatedAudioUpload = await cloudinary.uploader.upload(translatedAudioDataUrl, {
          resource_type: "video",
          folder: "chat-audio-translations",
        });
        translatedAudioUrl = translatedAudioUpload.secure_url;
      }
    }

    const normalizedReply =
      replyTo && replyTo.messageId
        ? {
            messageId: replyTo.messageId,
            text: (replyTo.text || "").toString().trim().slice(0, 400),
            image: Boolean(replyTo.image),
            senderId: replyTo.senderId,
          }
        : undefined;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audioUrl,
      audioMimeType: audioMimeType || undefined,
      audioDurationMs: Number.isFinite(audioDurationMs) ? audioDurationMs : undefined,
      audioTranscript: (audioTranscript || "").toString().trim().slice(0, 2000) || undefined,
      translation: translation
        ? {
            mode: translation.mode,
            provider: translation.provider || "azure",
            targetLanguage: translation.targetLanguage,
            sourceText: translation.sourceText,
            translatedText: translation.translatedText,
            translatedAudioUrl,
          }
        : undefined,
      replyTo: normalizedReply,
      isForwarded: Boolean(isForwarded),
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages." });
    }

    await Message.updateOne(
      { _id: messageId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          text: "",
          image: null,
          audioUrl: null,
          audioMimeType: null,
          audioDurationMs: null,
          audioTranscript: null,
          translation: null,
          replyTo: null,
          isForwarded: false,
        },
      }
    );

    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", {
        messageId: messageId.toString(),
        isDeleted: true,
      });
    }

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", {
        messageId: messageId.toString(),
        isDeleted: true,
      });
    }

    res.status(200).json({ message: "Message deleted successfully.", messageId, isDeleted: true });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const translateText = async (req, res) => {
  try {
    if (!AZURE_READY) {
      return res.status(500).json({ message: "Azure translation service is not configured." });
    }

    const text = (req.body?.text || "").toString().trim();
    const targetLanguage = (req.body?.targetLanguage || "").toString().trim().toLowerCase();

    if (!text) {
      return res.status(400).json({ message: "Text is required for translation." });
    }
    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required." });
    }

    const translatedText = await translateWithAzure({ text, targetLanguage });

    return res.status(200).json({
      translatedText,
      targetLanguage,
      provider: "azure",
    });
  } catch (error) {
    console.log("Error in translateText controller:", error.message);
    return res.status(500).json({ message: "Failed to translate text." });
  }
};

export const translateVoice = async (req, res) => {
  try {
    if (!AZURE_READY) {
      return res.status(500).json({ message: "Azure translation service is not configured." });
    }

    const text = (req.body?.text || "").toString().trim();
    const targetLanguage = (req.body?.targetLanguage || "").toString().trim().toLowerCase();

    if (!text) {
      return res.status(400).json({ message: "Text is required for voice translation." });
    }
    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required." });
    }

    const translatedText = await translateWithAzure({ text, targetLanguage });
    const translatedAudio = await synthesizeSpeechWithAzure({ text: translatedText, targetLanguage });

    return res.status(200).json({
      translatedText,
      translatedAudio,
      targetLanguage,
      provider: "azure",
    });
  } catch (error) {
    console.log("Error in translateVoice controller:", error.message);
    return res.status(500).json({ message: "Failed to translate voice." });
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

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: loggedInUserId,
          isRead: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadCountMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const chatPartnersWithUnreadCount = chatPartners.map((partner) => {
      const partnerObj = partner.toObject();
      return {
        ...partnerObj,
        unreadCount: unreadCountMap[partner._id.toString()] || 0,
      };
    });

    res.status(200).json(chatPartnersWithUnreadCount);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
