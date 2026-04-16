import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  authError: null,
  socket: null,
  onlineUsers: [],
  getClerkToken: null,

  setClerkTokenGetter: (getter) => set({ getClerkToken: getter }),

  checkAuth: async () => {
    set({ isCheckingAuth: true, authError: null });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, authError: null });
      await get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      const status = error?.response?.status;
      const isUnauthorized = status === 401 || status === 403;
      set({ authUser: null, authError: isUnauthorized ? "unauthorized" : "unknown" });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  clearAuth: () => {
    get().disconnectSocket();
    set({ authUser: null, isCheckingAuth: false, authError: null, onlineUsers: [] });
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

  connectSocket: async () => {
    const { authUser, getClerkToken } = get();
    const existingSocket = get().socket;

    if (!authUser) return;

    if (existingSocket) {
      if (!existingSocket.connected) {
        existingSocket.connect();
      }
      return;
    }

    const socket = io(BASE_URL, {
      auth: async (cb) => {
        const freshToken = await getClerkToken?.();
        cb({ token: freshToken || "" });
      },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("disconnect", () => {
      set({ onlineUsers: [] });
    });

    socket.on("connect_error", async (error) => {
      const message = error?.message || "";
      const isAuthError = /unauthorized|authentication|token|jwt/i.test(message);

      if (isAuthError) {
        const freshToken = await get().getClerkToken?.();
        socket.auth = { token: freshToken || "" };
      }
    });

    socket.connect();
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));
