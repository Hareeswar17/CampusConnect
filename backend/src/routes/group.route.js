import express from "express";
import {
  addMember,
  createDoubt,
  createDoubtComment,
  createEvent,
  createGroup,
  createProject,
  createResource,
  createTask,
  deleteEvent,
  deleteProject,
  deleteResource,
  deleteTask,
  getDoubtDetail,
  getGroup,
  getGroupRoster,
  getResources,
  joinGroup,
  leaveGroup,
  listDoubts,
  listEvents,
  listGroups,
  listProjects,
  listTasks,
  removeMember,
  searchUsers,
  updateEvent,
  updateProject,
  updateTask,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/group.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { protectRoute, requireTeacher, requireGroupMember } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/", listGroups);
router.post("/", requireTeacher, createGroup);

// Base group route (requireGroupMember allows access to '/' to fetch basic details for joining)
router.get("/:groupId", requireGroupMember, getGroup);
router.post("/:groupId/join", requireGroupMember, joinGroup);
router.post("/:groupId/leave", requireGroupMember, leaveGroup);
router.get("/:groupId/search-users", requireTeacher, searchUsers);
router.post("/:groupId/members", requireTeacher, addMember);
router.delete("/:groupId/members/:memberId", requireTeacher, removeMember);
router.get("/:groupId/roster", requireGroupMember, getGroupRoster);

router.get("/:groupId/events", requireGroupMember, listEvents);
router.post("/:groupId/events", requireTeacher, createEvent);
router.put("/:groupId/events/:eventId", requireTeacher, updateEvent);
router.delete("/:groupId/events/:eventId", requireTeacher, deleteEvent);

router.get("/:groupId/tasks", requireGroupMember, listTasks);
router.post("/:groupId/tasks", requireTeacher, createTask);
router.put("/:groupId/tasks/:taskId", requireTeacher, updateTask);
router.delete("/:groupId/tasks/:taskId", requireTeacher, deleteTask);

router.get("/:groupId/projects", requireGroupMember, listProjects);
router.post("/:groupId/projects", requireTeacher, createProject);
router.put("/:groupId/projects/:projectId", requireTeacher, updateProject);
router.delete("/:groupId/projects/:projectId", requireTeacher, deleteProject);

router.get("/:groupId/doubts", requireGroupMember, listDoubts);
router.post("/:groupId/doubts", requireGroupMember, createDoubt);
router.get("/:groupId/doubts/:doubtId", requireGroupMember, getDoubtDetail);
router.post("/:groupId/doubts/:doubtId/comments", requireGroupMember, createDoubtComment);

router.get("/:groupId/messages", requireGroupMember, getGroupMessages);
router.post("/:groupId/messages", requireGroupMember, sendGroupMessage);

router.get("/:groupId/resources", requireGroupMember, getResources);
router.post("/:groupId/resources", requireTeacher, createResource);
router.delete("/:groupId/resources/:resourceId", requireTeacher, deleteResource);

export default router;
