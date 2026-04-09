import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  discoverUsers: [],
  incomingRequests: [],
  outgoingRequests: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  replyingTo: null,
  isUsersLoading: false,
  isDiscoverLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),
  setSelectedUser: (selectedUser) =>
    set((state) => ({
      selectedUser,
      replyingTo: null,
      chats: selectedUser
        ? state.chats.map((chat) =>
            chat._id === selectedUser._id ? { ...chat, unreadCount: 0 } : chat
          )
        : state.chats,
    })),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getDiscoverUsers: async (query = "") => {
    set({ isDiscoverLoading: true });
    try {
      const trimmedQuery = query.trim();
      const res = await axiosInstance.get("/messages/discover", {
        params: { q: trimmedQuery },
      });
      set({ discoverUsers: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isDiscoverLoading: false });
    }
  },

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/messages/requests");
      set({
        incomingRequests: res.data?.incoming || [],
        outgoingRequests: res.data?.outgoing || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load requests");
    }
  },

  sendFriendRequest: async (userId, query = "") => {
    try {
      await axiosInstance.post(`/messages/requests/${userId}`);
      toast.success("Friend request sent");
      await Promise.all([get().getDiscoverUsers(query), get().getFriendRequests()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.patch(`/messages/requests/${userId}/accept`);
      toast.success("Friend request accepted");
      await Promise.all([
        get().getAllContacts(),
        get().getFriendRequests(),
        get().getDiscoverUsers(),
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  rejectFriendRequest: async (userId) => {
    try {
      await axiosInstance.patch(`/messages/requests/${userId}/reject`);
      toast.success("Friend request rejected");
      await Promise.all([get().getFriendRequests(), get().getDiscoverUsers()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set((state) => ({
        messages: res.data,
        chats: state.chats.map((chat) =>
          chat._id === userId ? { ...chat, unreadCount: 0 } : chat
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      replyTo: replyingTo
        ? {
            messageId: replyingTo._id,
            text: replyingTo.text || "",
            image: Boolean(replyingTo.image),
            senderId: replyingTo.senderId,
          }
        : undefined,
      isForwarded: Boolean(messageData.isForwarded),
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        ...messageData,
        replyTo: replyingTo
          ? {
              messageId: replyingTo._id,
              text: replyingTo.text || "",
              image: Boolean(replyingTo.image),
              senderId: replyingTo.senderId,
            }
          : undefined,
      });

      set({ replyingTo: null });

      set((state) => {
        const hasTempMessage = state.messages.some((msg) => msg._id === tempId);
        if (!hasTempMessage) {
          return { messages: state.messages.concat(res.data) };
        }

        return {
          messages: state.messages.map((msg) => (msg._id === tempId ? res.data : msg)),
        };
      });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isDeleted: true,
                text: "",
                image: null,
                replyTo: null,
                isForwarded: false,
              }
            : msg
        ),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  forwardMessage: async ({ targetUserId, text, image }) => {
    try {
      const { selectedUser } = get();
      const payload = {
        text: (text || "").trim(),
        image,
        isForwarded: true,
      };

      const res = await axiosInstance.post(`/messages/send/${targetUserId}`, payload);

      if (selectedUser && selectedUser._id === targetUserId) {
        set((state) => ({ messages: [...state.messages, res.data] }));
      }

      await get().getMyChatPartners();
      toast.success("Message forwarded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    }
  },

  subscribeToMessages: () => {
    const { isSoundEnabled } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, chats } = get();
      const isMessageSentFromSelectedUser = selectedUser
        ? newMessage.senderId === selectedUser._id
        : false;

      if (isMessageSentFromSelectedUser) {
        set({ messages: [...messages, newMessage] });
      }

      if (!isMessageSentFromSelectedUser) {
        const senderId = newMessage.senderId;
        const senderAlreadyInChats = chats.some((chat) => chat._id === senderId);

        if (senderAlreadyInChats) {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat._id === senderId
                ? {
                    ...chat,
                    unreadCount: (chat.unreadCount || 0) + 1,
                  }
                : chat
            ),
          }));
        } else {
          get().getMyChatPartners();
        }
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messagesRead", ({ messageIds }) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      const messageIdSet = new Set(messageIds.map((id) => id.toString()));

      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIdSet.has(msg._id?.toString()) ? { ...msg, isRead: true } : msg
        ),
      }));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      if (!messageId) return;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id?.toString() === messageId.toString()
            ? {
                ...msg,
                isDeleted: true,
                text: "",
                image: null,
                replyTo: null,
                isForwarded: false,
              }
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesRead");
    socket.off("messageDeleted");
  },
}));
