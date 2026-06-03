import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import {
  buildRedisKey,
  getRedisClient,
  redisDelete,
  redisJsonGet,
  redisJsonSet,
  redisSAdd,
  redisSMembers,
  redisSRem,
} from "./redis.js";

const toIdString = (value) => value?.toString?.() || String(value || "");
const conversationListCacheTTLSeconds = 60;
const onlineUsersSetKey = buildRedisKey("presence", "online-users");
const localOnlineUsers = new Set();

const getConversationListCacheKey = (userId) => buildRedisKey("conversation-list", toIdString(userId));

const normalizeConversationForCache = (conversation) => ({
  ...conversation,
  participants: (conversation?.participants || []).map((participantId) => toIdString(participantId)),
  lastMessageAt: conversation?.lastMessageAt ? new Date(conversation.lastMessageAt).toISOString() : null,
});

const denormalizeConversationFromCache = (conversation) => ({
  ...conversation,
  participants: (conversation?.participants || []).map((participantId) => participantId),
  lastMessageAt: conversation?.lastMessageAt ? new Date(conversation.lastMessageAt) : null,
});

const readConversationListCache = async (userId) => {
  const cached = await redisJsonGet(getConversationListCacheKey(userId));
  if (!Array.isArray(cached)) return null;
  return cached.map(denormalizeConversationFromCache);
};

const writeConversationListCache = async (userId, conversations) => {
  const normalized = conversations.map(normalizeConversationForCache);
  await redisJsonSet(getConversationListCacheKey(userId), normalized, conversationListCacheTTLSeconds);
};

export const invalidateConversationCache = async (...userIds) => {
  const keys = [...new Set(userIds.flat().map(toIdString).filter(Boolean).map(getConversationListCacheKey))];
  if (keys.length === 0) return;
  await redisDelete(keys);
};

export const markUserOnline = async (userId) => {
  const normalizedUserId = toIdString(userId);
  if (!normalizedUserId) return;

  localOnlineUsers.add(normalizedUserId);

  const redisClient = await getRedisClient();
  if (!redisClient) return;

  await redisSAdd(onlineUsersSetKey, normalizedUserId);
};

export const markUserOffline = async (userId) => {
  const normalizedUserId = toIdString(userId);
  if (!normalizedUserId) return;

  localOnlineUsers.delete(normalizedUserId);

  const redisClient = await getRedisClient();
  if (!redisClient) return;

  await redisSRem(onlineUsersSetKey, normalizedUserId);
};

export const getOnlineUserIds = async () => {
  const redisClient = await getRedisClient();
  if (!redisClient) {
    return [...localOnlineUsers];
  }

  const onlineUserIds = await redisSMembers(onlineUsersSetKey);
  return onlineUserIds.map((id) => id.toString());
};

const buildPreview = (message) => {
  if (!message || message.isDeleted) return "Message deleted";

  const text = (message.text || "").toString().trim();
  if (text) return text.slice(0, 120);

  if (message.image && message.audioUrl) return "Photo and voice note";
  if (message.image) return "Photo";
  if (message.audioUrl) return "Voice note";

  return "New message";
};

export const getConversationKey = (firstUserId, secondUserId) =>
  [toIdString(firstUserId), toIdString(secondUserId)].sort().join(":");

export const upsertConversationForMessage = async ({ senderId, receiverId, message }) => {
  const participantsKey = getConversationKey(senderId, receiverId);
  const lastMessageAt = message?.createdAt ? new Date(message.createdAt) : new Date();
  const lastMessage = buildPreview(message);

  await Conversation.findOneAndUpdate(
    { participantsKey },
    {
      $setOnInsert: {
        participants: [senderId, receiverId],
        participantsKey,
      },
      $set: {
        lastMessage,
        lastMessageAt,
        lastMessageSenderId: senderId,
      },
      $inc: {
        [`unreadCounts.${receiverId.toString()}`]: 1,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await invalidateConversationCache(senderId, receiverId);
};

export const markConversationRead = async ({ senderId, receiverId }) => {
  const participantsKey = getConversationKey(senderId, receiverId);
  await Conversation.updateOne(
    { participantsKey },
    {
      $set: {
        [`unreadCounts.${receiverId.toString()}`]: 0,
      },
    }
  );

  await invalidateConversationCache(senderId, receiverId);
};

export const hydrateConversationSummariesFromMessages = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const summaries = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $addFields: {
        senderStr: { $toString: "$senderId" },
        receiverStr: { $toString: "$receiverId" },
      },
    },
    {
      $addFields: {
        participantsKey: {
          $cond: [
            { $lt: ["$senderStr", "$receiverStr"] },
            { $concat: ["$senderStr", ":", "$receiverStr"] },
            { $concat: ["$receiverStr", ":", "$senderStr"] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$participantsKey",
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiverId", userObjectId] },
                  { $ne: ["$isRead", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  if (summaries.length === 0) {
    return [];
  }

  const bulkOps = summaries.map((summary) => {
    const lastMessage = summary.lastMessage || {};
    return {
      updateOne: {
        filter: { participantsKey: summary._id },
        update: {
          $setOnInsert: {
            participants: [lastMessage.senderId, lastMessage.receiverId],
            participantsKey: summary._id,
          },
          $set: {
            lastMessage: buildPreview(lastMessage),
            lastMessageAt: lastMessage.createdAt || new Date(),
            lastMessageSenderId: lastMessage.senderId,
            [`unreadCounts.${userId.toString()}`]: summary.unreadCount || 0,
          },
        },
        upsert: true,
      },
    };
  });

  if (bulkOps.length > 0) {
    await Conversation.bulkWrite(bulkOps);
  }

  return Conversation.find({ participants: userId }).sort({ lastMessageAt: -1 }).lean();
};

export const getConversationListForUser = async (userId) => {
  const cachedConversations = await readConversationListCache(userId);
  if (cachedConversations) {
    return cachedConversations;
  }

  const conversations = await Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .lean();

  const resolvedConversations =
    conversations.length > 0 ? conversations : await hydrateConversationSummariesFromMessages(userId);

  if (resolvedConversations.length === 0) {
    return [];
  }

  const partnerIds = resolvedConversations
    .map((conversation) =>
      conversation.participants.find((participantId) => toIdString(participantId) !== toIdString(userId))
    )
    .map((id) => toIdString(id))
    .filter(Boolean);

  const uniquePartnerIds = [...new Set(partnerIds)];
  const partners = await User.find({ _id: { $in: uniquePartnerIds } })
    .select("_id fullName profilePic")
    .lean();

  const partnersById = partners.reduce((acc, partner) => {
    acc[partner._id.toString()] = partner;
    return acc;
  }, {});

  return resolvedConversations
    .map((conversation) => {
      const partnerId = conversation.participants.find(
        (participantId) => toIdString(participantId) !== toIdString(userId)
      );
      const partner = partnersById[toIdString(partnerId)];
      if (!partner) return null;

      return {
        ...partner,
        lastMessage: conversation.lastMessage || "Tap to continue",
        lastMessageTime: conversation.lastMessageAt || null,
        unreadCount:
          conversation.unreadCounts?.[userId.toString()] ||
          conversation.unreadCounts?.get?.(userId.toString()) ||
          0,
      };
    })
    .filter(Boolean);

  await writeConversationListCache(userId, resolvedConversations);

  return resolvedConversations;
};