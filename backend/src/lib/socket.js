import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";
import {
  getConversationKey,
  getOnlineUserIds,
  markConversationRead,
  markUserOffline,
  markUserOnline,
} from "./conversation.js";

const app = express();
const server = http.createServer(app);

const configuredClientOrigin = ENV.CLIENT_URL;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === configuredClientOrigin) return true;

  if (ENV.NODE_ENV === "development" && /^http:\/\/localhost:\d+$/.test(origin)) {
    return true;
  }

  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}
const pendingReadBatches = new Map();

const broadcastOnlineUsers = async () => {
  try {
    const onlineUsers = await getOnlineUserIds();
    io.emit("getOnlineUsers", onlineUsers);
  } catch {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
};

const flushReadBatch = async (key) => {
  const batch = pendingReadBatches.get(key);
  if (!batch) return;
  pendingReadBatches.delete(key);

  const { senderId, receiverId, messageIds } = batch;
  try {
    const unreadIncomingMessages = await Message.find({
      senderId,
      receiverId,
      isRead: { $ne: true },
      ...(messageIds.length > 0 ? { _id: { $in: [...messageIds] } } : {}),
    }).select("_id");

    if (unreadIncomingMessages.length === 0) {
      return;
    }

    const unreadMessageIds = unreadIncomingMessages.map((msg) => msg._id);

    await Message.updateMany(
      { _id: { $in: unreadMessageIds } },
      {
        $set: { isRead: true },
      }
    );

    await markConversationRead({ senderId, receiverId });

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readerId: receiverId.toString(),
        messageIds: unreadMessageIds.map((id) => id.toString()),
      });
    }
  } catch (error) {
    console.log("Error in batched markMessagesRead socket handler:", error.message);
  }
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  void markUserOnline(userId).then(broadcastOnlineUsers).catch(() => {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // with socket.on we listen for events from clients
  socket.on("markMessagesRead", async (payload = {}) => {
    try {
      const receiverId = socket.userId;
      const senderId = payload?.senderId?.toString?.() || payload?.senderId;
      const messageIds = Array.isArray(payload?.messageIds)
        ? payload.messageIds.map((id) => id?.toString?.() || id).filter(Boolean)
        : [];

      if (!senderId) {
        return;
      }

      const batchKey = getConversationKey(senderId, receiverId);
      const existingBatch = pendingReadBatches.get(batchKey);
      if (existingBatch) {
        messageIds.forEach((id) => existingBatch.messageIds.add(id));
        return;
      }

      pendingReadBatches.set(batchKey, {
        senderId,
        receiverId,
        messageIds: new Set(messageIds),
      });

      setTimeout(() => flushReadBatch(batchKey), 200);
    } catch (error) {
      console.log("Error in markMessagesRead socket handler:", error.message);
    }
  });

  socket.on("joinGroup", (groupId) => {
    if (groupId) {
      socket.join(`group_${groupId}`);
    }
  });

  socket.on("leaveGroup", (groupId) => {
    if (groupId) {
      socket.leave(`group_${groupId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }
    void markUserOffline(userId).then(broadcastOnlineUsers).catch(() => {
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
});

export { io, app, server };
