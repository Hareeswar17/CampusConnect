import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const upsertById = (items, next) => {
  const index = items.findIndex((item) => item.id === next.id || item._id === next._id);
  if (index === -1) return [next, ...items];
  const updated = items.slice();
  updated[index] = next;
  return updated;
};

export const useGroupStore = create((set, get) => ({
  groups: [],
  groupById: {},
  rosterByGroup: {},
  eventsByGroup: {},
  tasksByGroup: {},
  projectsByGroup: {},
  doubtsByGroup: {},
  doubtDetailById: {},
  resourcesByGroup: {},
  messagesByGroup: {},
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data || [] });
    } catch (error) {
      console.log("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroup: async (groupId) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      set((state) => ({
        groupById: { ...state.groupById, [groupId]: res.data },
      }));
      return res.data;
    } catch (error) {
      console.log("Error fetching group:", error);
      return null;
    }
  },

  createGroup: async (payload) => {
    try {
      const res = await axiosInstance.post("/groups", payload);
      set((state) => ({ groups: upsertById(state.groups, res.data) }));
      return res.data;
    } catch (error) {
      console.log("Error creating group:", error);
      toast.error(error?.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  joinGroup: async (groupId) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/join`);
      set((state) => ({ groups: upsertById(state.groups, res.data) }));
      toast.success("Joined group!");
      return res.data;
    } catch (error) {
      console.log("Error joining group:", error);
      toast.error(error?.response?.data?.message || "Failed to join group");
      return null;
    }
  },

  leaveGroup: async (groupId) => {
    if (!groupId) return false;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/leave`);
      set((state) => ({ groups: upsertById(state.groups, res.data) }));
      toast.success("Left group");
      return true;
    } catch (error) {
      console.log("Error leaving group:", error);
      toast.error(error?.response?.data?.message || "Failed to leave group");
      return false;
    }
  },

  searchUsersForGroup: async (groupId, query) => {
    if (!groupId || !query || query.trim().length < 2) return [];
    try {
      const res = await axiosInstance.get(
        `/groups/${groupId}/search-users?q=${encodeURIComponent(query.trim())}`
      );
      return res.data || [];
    } catch (error) {
      console.log("Error searching users:", error);
      return [];
    }
  },

  addMember: async (groupId, userId) => {
    if (!groupId || !userId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
      set((state) => ({
        groups: upsertById(state.groups, res.data.group),
        rosterByGroup: {
          ...state.rosterByGroup,
          [groupId]: {
            ...state.rosterByGroup[groupId],
            students: [
              ...(state.rosterByGroup[groupId]?.students || []),
              res.data.addedUser,
            ],
          },
        },
      }));
      toast.success(`Added ${res.data.addedUser.fullName} to the group`);
      return res.data;
    } catch (error) {
      console.log("Error adding member:", error);
      toast.error(error?.response?.data?.message || "Failed to add member");
      return null;
    }
  },

  removeMember: async (groupId, memberId) => {
    if (!groupId || !memberId) return false;
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
      set((state) => ({
        groups: upsertById(state.groups, res.data),
        rosterByGroup: {
          ...state.rosterByGroup,
          [groupId]: {
            teachers: (state.rosterByGroup[groupId]?.teachers || []).filter(
              (t) => t._id !== memberId
            ),
            students: (state.rosterByGroup[groupId]?.students || []).filter(
              (s) => s._id !== memberId
            ),
          },
        },
      }));
      toast.success("Member removed");
      return true;
    } catch (error) {
      console.log("Error removing member:", error);
      toast.error(error?.response?.data?.message || "Failed to remove member");
      return false;
    }
  },

  fetchRoster: async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/roster`);
      set((state) => ({
        rosterByGroup: { ...state.rosterByGroup, [groupId]: res.data },
      }));
    } catch (error) {
      console.log("Error fetching roster:", error);
    }
  },

  fetchEvents: async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/events`);
      set((state) => ({
        eventsByGroup: { ...state.eventsByGroup, [groupId]: res.data || [] },
      }));
    } catch (error) {
      console.log("Error fetching events:", error);
    }
  },

  createEvent: async (groupId, payload) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/events`, payload);
      set((state) => {
        const existing = state.eventsByGroup[groupId] || [];
        return {
          eventsByGroup: {
            ...state.eventsByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      return res.data;
    } catch (error) {
      console.log("Error creating event:", error);
      toast.error(error?.response?.data?.message || "Failed to create event");
      return null;
    }
  },

  updateEvent: async (groupId, eventId, payload) => {
    if (!groupId || !eventId) return null;
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/events/${eventId}`, payload);
      set((state) => {
        const existing = state.eventsByGroup[groupId] || [];
        return {
          eventsByGroup: {
            ...state.eventsByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      toast.success("Event updated");
      return res.data;
    } catch (error) {
      console.log("Error updating event:", error);
      toast.error(error?.response?.data?.message || "Failed to update event");
      return null;
    }
  },

  deleteEvent: async (groupId, eventId) => {
    if (!groupId || !eventId) return false;
    try {
      await axiosInstance.delete(`/groups/${groupId}/events/${eventId}`);
      set((state) => {
        const existing = state.eventsByGroup[groupId] || [];
        return {
          eventsByGroup: {
            ...state.eventsByGroup,
            [groupId]: existing.filter((e) => e._id !== eventId && e.id !== eventId),
          },
        };
      });
      toast.success("Event deleted");
      return true;
    } catch (error) {
      console.log("Error deleting event:", error);
      toast.error(error?.response?.data?.message || "Failed to delete event");
      return false;
    }
  },

  fetchTasks: async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/tasks`);
      set((state) => ({
        tasksByGroup: { ...state.tasksByGroup, [groupId]: res.data || [] },
      }));
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  },

  createTask: async (groupId, payload) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/tasks`, payload);
      set((state) => {
        const existing = state.tasksByGroup[groupId] || [];
        return {
          tasksByGroup: {
            ...state.tasksByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      return res.data;
    } catch (error) {
      console.log("Error creating task:", error);
      toast.error(error?.response?.data?.message || "Failed to create task");
      return null;
    }
  },

  updateTask: async (groupId, taskId, payload) => {
    if (!groupId || !taskId) return null;
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/tasks/${taskId}`, payload);
      set((state) => {
        const existing = state.tasksByGroup[groupId] || [];
        return {
          tasksByGroup: {
            ...state.tasksByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      toast.success("Task updated");
      return res.data;
    } catch (error) {
      console.log("Error updating task:", error);
      toast.error(error?.response?.data?.message || "Failed to update task");
      return null;
    }
  },

  deleteTask: async (groupId, taskId) => {
    if (!groupId || !taskId) return false;
    try {
      await axiosInstance.delete(`/groups/${groupId}/tasks/${taskId}`);
      set((state) => {
        const existing = state.tasksByGroup[groupId] || [];
        return {
          tasksByGroup: {
            ...state.tasksByGroup,
            [groupId]: existing.filter((t) => t._id !== taskId && t.id !== taskId),
          },
        };
      });
      toast.success("Task deleted");
      return true;
    } catch (error) {
      console.log("Error deleting task:", error);
      toast.error(error?.response?.data?.message || "Failed to delete task");
      return false;
    }
  },

  fetchProjects: async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/projects`);
      set((state) => ({
        projectsByGroup: { ...state.projectsByGroup, [groupId]: res.data || [] },
      }));
    } catch (error) {
      console.log("Error fetching projects:", error);
    }
  },

  createProject: async (groupId, payload) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/projects`, payload);
      set((state) => {
        const existing = state.projectsByGroup[groupId] || [];
        return {
          projectsByGroup: {
            ...state.projectsByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      return res.data;
    } catch (error) {
      console.log("Error creating project:", error);
      toast.error(error?.response?.data?.message || "Failed to create project");
      return null;
    }
  },

  updateProject: async (groupId, projectId, payload) => {
    if (!groupId || !projectId) return null;
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/projects/${projectId}`, payload);
      set((state) => {
        const existing = state.projectsByGroup[groupId] || [];
        return {
          projectsByGroup: {
            ...state.projectsByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      toast.success("Project updated");
      return res.data;
    } catch (error) {
      console.log("Error updating project:", error);
      toast.error(error?.response?.data?.message || "Failed to update project");
      return null;
    }
  },

  deleteProject: async (groupId, projectId) => {
    if (!groupId || !projectId) return false;
    try {
      await axiosInstance.delete(`/groups/${groupId}/projects/${projectId}`);
      set((state) => {
        const existing = state.projectsByGroup[groupId] || [];
        return {
          projectsByGroup: {
            ...state.projectsByGroup,
            [groupId]: existing.filter((p) => p._id !== projectId && p.id !== projectId),
          },
        };
      });
      toast.success("Project deleted");
      return true;
    } catch (error) {
      console.log("Error deleting project:", error);
      toast.error(error?.response?.data?.message || "Failed to delete project");
      return false;
    }
  },

  fetchDoubts: async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/doubts`);
      set((state) => ({
        doubtsByGroup: { ...state.doubtsByGroup, [groupId]: res.data || [] },
      }));
    } catch (error) {
      console.log("Error fetching doubts:", error);
    }
  },

  createDoubt: async (groupId, payload) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/doubts`, payload);
      set((state) => {
        const existing = state.doubtsByGroup[groupId] || [];
        return {
          doubtsByGroup: {
            ...state.doubtsByGroup,
            [groupId]: upsertById(existing, res.data),
          },
        };
      });
      return res.data;
    } catch (error) {
      console.log("Error creating doubt:", error);
      toast.error(error?.response?.data?.message || "Failed to post doubt");
      return null;
    }
  },

  fetchDoubtDetail: async (groupId, doubtId) => {
    if (!groupId || !doubtId) return null;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/doubts/${doubtId}`);
      set((state) => ({
        doubtDetailById: { ...state.doubtDetailById, [doubtId]: res.data },
      }));
      return res.data;
    } catch (error) {
      console.log("Error fetching doubt detail:", error);
      return null;
    }
  },

  addDoubtComment: async (groupId, doubtId, payload) => {
    if (!groupId || !doubtId) return null;
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/doubts/${doubtId}/comments`,
        payload
      );
      set((state) => {
        const currentDetail = state.doubtDetailById[doubtId];
        const updatedDetail = currentDetail
          ? {
              ...currentDetail,
              doubt: res.data.doubt,
              comments: [res.data.comment, ...(currentDetail.comments || [])],
            }
          : currentDetail;

        const currentList = state.doubtsByGroup[groupId] || [];
        const updatedList = currentList.map((item) =>
          item._id === res.data.doubt?._id ? res.data.doubt : item
        );

        return {
          doubtDetailById: {
            ...state.doubtDetailById,
            [doubtId]: updatedDetail,
          },
          doubtsByGroup: {
            ...state.doubtsByGroup,
            [groupId]: updatedList,
          },
        };
      });
      return res.data;
    } catch (error) {
      console.log("Error adding doubt comment:", error);
      toast.error(error?.response?.data?.message || "Failed to add comment");
      return null;
    }
  },

  fetchResources: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/resources`);
      set((state) => ({
        resourcesByGroup: { ...state.resourcesByGroup, [groupId]: res.data },
      }));
    } catch (error) {
      console.log("Error fetching resources:", error);
      toast.error("Failed to load resources");
    }
  },

  createResource: async (groupId, payload) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/resources`, payload);
      set((state) => {
        const currentList = state.resourcesByGroup[groupId] || [];
        return {
          resourcesByGroup: {
            ...state.resourcesByGroup,
            [groupId]: [res.data, ...currentList],
          },
        };
      });
      toast.success("Resource added successfully");
      return res.data;
    } catch (error) {
      console.log("Error adding resource:", error);
      toast.error(error?.response?.data?.message || "Failed to add resource");
      return null;
    }
  },

  deleteResource: async (groupId, resourceId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/resources/${resourceId}`);
      set((state) => {
        const currentList = state.resourcesByGroup[groupId] || [];
        return {
          resourcesByGroup: {
            ...state.resourcesByGroup,
            [groupId]: currentList.filter((r) => r._id !== resourceId),
          },
        };
      });
      toast.success("Resource removed");
      return true;
    } catch (error) {
      console.log("Error deleting resource:", error);
      toast.error("Failed to delete resource");
      return false;
    }
  },

  fetchGroupMessages: async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set((state) => ({
        messagesByGroup: { ...state.messagesByGroup, [groupId]: res.data },
      }));
    } catch (error) {
      console.log("Error fetching group messages:", error);
    }
  },

  sendGroupMessage: async (groupId, payload) => {
    if (!groupId) return null;
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, payload);
      set((state) => {
        const currentMessages = state.messagesByGroup[groupId] || [];
        return {
          messagesByGroup: {
            ...state.messagesByGroup,
            [groupId]: [...currentMessages, res.data],
          },
        };
      });
      return res.data;
    } catch (error) {
      console.log("Error sending group message:", error);
      toast.error("Failed to send message");
      return null;
    }
  },

  subscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !groupId) return;

    socket.emit("joinGroup", groupId);

    // To prevent multiple listeners if called again
    socket.off("newGroupMessage");
    socket.on("newGroupMessage", (message) => {
      if (message.groupId !== groupId) return;
      set((state) => {
        const currentMessages = state.messagesByGroup[groupId] || [];
        // Only add if not already optimistic
        const isDuplicate = currentMessages.some((m) => m._id === message._id);
        if (isDuplicate) return state;

        return {
          messagesByGroup: {
            ...state.messagesByGroup,
            [groupId]: [...currentMessages, message],
          },
        };
      });
    });
  },

  unsubscribeFromGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !groupId) return;

    socket.emit("leaveGroup", groupId);
    socket.off("newGroupMessage");
  },
}));
