import mongoose from "mongoose";
import Group from "../models/Group.js";
import GroupEvent from "../models/GroupEvent.js";
import GroupTask from "../models/GroupTask.js";
import GroupProject from "../models/GroupProject.js";
import GroupDoubt from "../models/GroupDoubt.js";
import GroupDoubtComment from "../models/GroupDoubtComment.js";
import GroupResource from "../models/GroupResource.js";
import GroupMessage from "../models/GroupMessage.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const requireGroup = async (groupId) => {
  if (!isValidObjectId(groupId)) return null;
  return Group.findById(groupId);
};

const formatGroup = (group, userId) => {
  const memberIds = (group.members || []).map((id) => id.toString());
  const teacherIds = (group.teachers || []).map((id) => id.toString());
  const uid = userId ? userId.toString() : "";
  return {
    id: group._id,
    title: group.title,
    subtitle: group.subtitle,
    description: group.description,
    cover: group.cover,
    createdBy: group.createdBy,
    teachersCount: teacherIds.length,
    membersCount: memberIds.length,
    isMember: uid ? memberIds.includes(uid) || teacherIds.includes(uid) : false,
    isGroupTeacher: uid ? teacherIds.includes(uid) : false,
    createdAt: group.createdAt,
  };
};

export const listGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    const userId = req.user?._id;
    res.status(200).json(groups.map((g) => formatGroup(g, userId)));
  } catch (error) {
    console.log("Error listing groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(formatGroup(group, req.user?._id));
  } catch (error) {
    console.log("Error getting group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { title, subtitle, description, cover } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const group = await Group.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      description: description?.trim() || "",
      cover: cover || "",
      createdBy: req.user._id,
      teachers: [req.user._id],
      members: [req.user._id],
    });

    res.status(201).json(formatGroup(group, req.user._id));
  } catch (error) {
    console.log("Error creating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const userId = req.user._id;
    const memberIds = group.members.map((id) => id.toString());
    if (memberIds.includes(userId.toString())) {
      return res.status(400).json({ message: "Already a member of this group" });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json(formatGroup(group, userId));
  } catch (error) {
    console.log("Error joining group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const userId = req.user._id.toString();

    // Creator cannot leave
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({ message: "Group creator cannot leave. Delete the group instead." });
    }

    group.members = group.members.filter((id) => id.toString() !== userId);
    group.teachers = group.teachers.filter((id) => id.toString() !== userId);
    await group.save();

    res.status(200).json(formatGroup(group, req.user._id));
  } catch (error) {
    console.log("Error leaving group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json([]);
    }

    const query = q.trim();
    const memberIds = group.members.map((id) => id.toString());

    const users = await User.find({
      $and: [
        { _id: { $nin: group.members } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("_id fullName email profilePic role")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { userId, email } = req.body;
    let targetUser = null;

    if (userId && isValidObjectId(userId)) {
      targetUser = await User.findById(userId);
    } else if (email?.trim()) {
      targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "No user found" });
    }

    const memberIds = group.members.map((id) => id.toString());
    if (memberIds.includes(targetUser._id.toString())) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(targetUser._id);
    await group.save();

    res.status(200).json({
      group: formatGroup(group, req.user._id),
      addedUser: {
        _id: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        profilePic: targetUser.profilePic,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.log("Error adding member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { memberId } = req.params;
    if (!isValidObjectId(memberId)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    // Cannot remove the creator
    if (group.createdBy.toString() === memberId) {
      return res.status(400).json({ message: "Cannot remove the group creator" });
    }

    group.members = group.members.filter((id) => id.toString() !== memberId);
    group.teachers = group.teachers.filter((id) => id.toString() !== memberId);
    await group.save();

    res.status(200).json(formatGroup(group, req.user._id));
  } catch (error) {
    console.log("Error removing member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupRoster = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const teacherIds = group.teachers || [];
    const memberIds = group.members || [];

    const [teachers, members] = await Promise.all([
      User.find({ _id: { $in: teacherIds } }).select(
        "-password -teacherVerification.codeHash"
      ),
      User.find({ _id: { $in: memberIds } }).select(
        "-password -teacherVerification.codeHash"
      ),
    ]);

    const teacherSet = new Set(teacherIds.map((id) => id.toString()));
    const students = members.filter((member) => !teacherSet.has(member._id.toString()));

    res.status(200).json({
      teachers,
      students,
    });
  } catch (error) {
    console.log("Error getting roster:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listEvents = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const status = (req.query.status || "upcoming").toLowerCase();
    const now = new Date();
    const completedCutoff = { $lt: now };
    const upcomingCutoff = { $gte: now };

    const filter = { groupId: group._id };
    if (status === "completed") {
      filter.$or = [{ endAt: completedCutoff }, { endAt: null, startAt: completedCutoff }];
    } else if (status === "all") {
      // no extra filter
    } else {
      filter.$or = [{ endAt: upcomingCutoff }, { endAt: null, startAt: upcomingCutoff }];
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
    const projection = "title startAt endAt type location coverImage createdBy description links";
    const events = await GroupEvent.find(filter)
      .sort({ startAt: 1 })
      .limit(limit)
      .select(projection)
      .lean();

    res.status(200).json(events);
  } catch (error) {
    console.log("Error listing events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { title, description, type, location, startAt, endAt, links, coverImage } = req.body;
    if (!title?.trim() || !startAt) {
      return res.status(400).json({ message: "Title and start time are required" });
    }

    const cleanLinks = Array.isArray(links)
      ? links.map((l) => l.trim()).filter(Boolean)
      : [];

    const event = await GroupEvent.create({
      groupId: group._id,
      title: title.trim(),
      description: description?.trim() || "",
      type: type?.trim() || "General",
      location: location?.trim() || "",
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      links: cleanLinks,
      coverImage: coverImage?.trim() || "",
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.log("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { eventId } = req.params;
    if (!isValidObjectId(eventId)) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { title, description, type, location, startAt, endAt, links, coverImage } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (type !== undefined) updates.type = type.trim();
    if (location !== undefined) updates.location = location.trim();
    if (startAt !== undefined) updates.startAt = new Date(startAt);
    if (endAt !== undefined) updates.endAt = endAt ? new Date(endAt) : null;
    if (links !== undefined) updates.links = Array.isArray(links) ? links.map((l) => l.trim()).filter(Boolean) : [];
    if (coverImage !== undefined) updates.coverImage = coverImage.trim();

    const event = await GroupEvent.findOneAndUpdate(
      { _id: eventId, groupId: group._id },
      updates,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    console.log("Error updating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { eventId } = req.params;
    if (!isValidObjectId(eventId)) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = await GroupEvent.findOneAndDelete({
      _id: eventId,
      groupId: group._id,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.log("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listTasks = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const status = (req.query.status || "upcoming").toLowerCase();
    const now = new Date();
    const completedCutoff = { $lt: now };
    const upcomingCutoff = { $gte: now };
    const filter = { groupId: group._id };
    if (status === "completed") {
      filter.dueAt = completedCutoff;
    } else if (status === "all") {
      // no extra filter
    } else {
      filter.dueAt = upcomingCutoff;
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
    const projection = "title dueAt points formUrl status description createdBy";
    const tasks = await GroupTask.find(filter)
      .sort({ dueAt: 1 })
      .limit(limit)
      .select(projection)
      .lean();

    res.status(200).json(tasks);
  } catch (error) {
    console.log("Error listing tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { title, description, dueAt, points, formUrl, status } = req.body;
    if (!title?.trim() || !dueAt) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const task = await GroupTask.create({
      groupId: group._id,
      title: title.trim(),
      description: description?.trim() || "",
      dueAt: new Date(dueAt),
      points: points?.trim() || "",
      formUrl: formUrl?.trim() || "",
      status: status === "Closed" ? "Closed" : "Open",
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log("Error creating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { taskId } = req.params;
    if (!isValidObjectId(taskId)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, dueAt, points, formUrl, status } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (dueAt !== undefined) updates.dueAt = new Date(dueAt);
    if (points !== undefined) updates.points = points.trim();
    if (formUrl !== undefined) updates.formUrl = formUrl.trim();
    if (status !== undefined) updates.status = status === "Closed" ? "Closed" : "Open";

    const task = await GroupTask.findOneAndUpdate(
      { _id: taskId, groupId: group._id },
      updates,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    console.log("Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { taskId } = req.params;
    if (!isValidObjectId(taskId)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await GroupTask.findOneAndDelete({
      _id: taskId,
      groupId: group._id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.log("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listProjects = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const status = (req.query.status || "upcoming").toLowerCase();
    const now = new Date();
    const completedCutoff = { $lt: now };
    const upcomingCutoff = { $gte: now };
    const filter = { groupId: group._id };
    if (status === "completed") {
      filter.deadline = completedCutoff;
    } else if (status === "all") {
      // no extra filter
    } else {
      filter.deadline = upcomingCutoff;
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
    const projection = "title deadline type maxMembers description createdBy";
    const projects = await GroupProject.find(filter)
      .sort({ deadline: 1 })
      .limit(limit)
      .select(projection)
      .lean();

    res.status(200).json(projects);
  } catch (error) {
    console.log("Error listing projects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createProject = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { title, description, deadline, type, maxMembers } = req.body;
    if (!title?.trim() || !deadline) {
      return res.status(400).json({ message: "Title and deadline are required" });
    }

    const project = await GroupProject.create({
      groupId: group._id,
      title: title.trim(),
      description: description?.trim() || "",
      deadline: new Date(deadline),
      type: type === "Individual" ? "Individual" : "Team",
      maxMembers: Number.isFinite(Number(maxMembers)) ? Number(maxMembers) : 1,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    console.log("Error creating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { projectId } = req.params;
    if (!isValidObjectId(projectId)) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { title, description, deadline, type, maxMembers } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (deadline !== undefined) updates.deadline = new Date(deadline);
    if (type !== undefined) updates.type = type === "Individual" ? "Individual" : "Team";
    if (maxMembers !== undefined) updates.maxMembers = Number.isFinite(Number(maxMembers)) ? Number(maxMembers) : 1;

    const project = await GroupProject.findOneAndUpdate(
      { _id: projectId, groupId: group._id },
      updates,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json(project);
  } catch (error) {
    console.log("Error updating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { projectId } = req.params;
    if (!isValidObjectId(projectId)) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = await GroupProject.findOneAndDelete({
      _id: projectId,
      groupId: group._id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.log("Error deleting project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listDoubts = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const doubts = await GroupDoubt.find({ groupId: group._id }).sort({ createdAt: -1 });
    res.status(200).json(doubts);
  } catch (error) {
    console.log("Error listing doubts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDoubt = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { title, topic, description, assignedToTeacher, isUrgent, attachmentData } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    let attachmentUrl = "";
    if (attachmentData) {
      const uploadResponse = await cloudinary.uploader.upload(attachmentData, {
        resource_type: "auto",
        folder: "campusconnect/doubts",
      });
      attachmentUrl = uploadResponse.secure_url;
    }

    const summary = description.trim().slice(0, 180);
    const actorName = req.user?.fullName || "";
    const actorRole = req.user?.role === "teacher" ? "teacher" : "student";

    const doubt = await GroupDoubt.create({
      groupId: group._id,
      attachmentUrl,
      title: title.trim(),
      topic: topic?.trim() || "General",
      description: description.trim(),
      summary,
      assignedToTeacher: Boolean(assignedToTeacher),
      isUrgent: Boolean(isUrgent),
      createdBy: req.user._id,
      createdByName: actorName,
      createdByRole: actorRole,
      auditLog: [
        {
          type: "created",
          message: "Doubt created",
          actorId: req.user._id,
          actorName,
          actorRole,
        },
      ],
    });

    res.status(201).json(doubt);
  } catch (error) {
    console.log("Error creating doubt:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDoubtDetail = async (req, res) => {
  try {
    const { groupId, doubtId } = req.params;
    const group = await requireGroup(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isValidObjectId(doubtId)) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const doubt = await GroupDoubt.findOne({ _id: doubtId, groupId: group._id });
    if (!doubt) return res.status(404).json({ message: "Doubt not found" });

    const comments = await GroupDoubtComment.find({
      doubtId: doubt._id,
      groupId: group._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      doubt,
      comments,
      auditLog: doubt.auditLog || [],
    });
  } catch (error) {
    console.log("Error fetching doubt detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDoubtComment = async (req, res) => {
  try {
    const { groupId, doubtId } = req.params;
    const group = await requireGroup(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isValidObjectId(doubtId)) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const doubt = await GroupDoubt.findOne({ _id: doubtId, groupId: group._id });
    if (!doubt) return res.status(404).json({ message: "Doubt not found" });

    const { text, type } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const authorRole = req.user?.role === "teacher" ? "teacher" : "student";
    const authorName = req.user?.fullName || "";
    const commentType = type === "question" ? "question" : "clarification";

    const comment = await GroupDoubtComment.create({
      groupId: group._id,
      doubtId: doubt._id,
      type: commentType,
      text: text.trim(),
      authorId: req.user._id,
      authorName,
      authorRole,
    });

    const updates = { $inc: { commentsCount: 1 } };
    const auditUpdates = [];

    const canResolve =
      commentType === "clarification" &&
      doubt.status !== "resolved" &&
      (!doubt.assignedToTeacher || authorRole === "teacher");

    if (canResolve) {
      updates.$set = {
        status: "resolved",
        resolvedBy: req.user._id,
        resolvedByName: authorName,
        resolvedByRole: authorRole,
        resolvedAt: new Date(),
      };
      auditUpdates.push({
        type: "resolved",
        message:
          authorRole === "teacher"
            ? "Resolved by teacher"
            : "Resolved by student",
        actorId: req.user._id,
        actorName,
        actorRole: authorRole,
      });
    }

    if (auditUpdates.length) {
      updates.$push = { auditLog: { $each: auditUpdates } };
    }

    const updatedDoubt = await GroupDoubt.findByIdAndUpdate(doubt._id, updates, {
      new: true,
    });

    res.status(201).json({
      comment,
      doubt: updatedDoubt,
    });
  } catch (error) {
    console.log("Error creating doubt comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getResources = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const resources = await GroupResource.find({ groupId: group._id }).sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    console.log("Error fetching resources:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createResource = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { title, url, category, type, size, fileData } = req.body;
    if (!title?.trim() || !category?.trim()) {
      return res.status(400).json({ message: "Title and category are required" });
    }
    
    if (!url?.trim() && !fileData) {
      return res.status(400).json({ message: "Either url or fileData is required" });
    }

    let finalUrl = url?.trim() || "";

    if (fileData) {
      const uploadResponse = await cloudinary.uploader.upload(fileData, {
        resource_type: "auto",
        folder: "campusconnect/resources",
      });
      finalUrl = uploadResponse.secure_url;
    }

    const resource = await GroupResource.create({
      groupId: group._id,
      title: title.trim(),
      url: finalUrl,
      category: category.trim(),
      type: type?.trim() || "LINK",
      size: size?.trim() || "",
      uploadedBy: req.user._id,
    });

    res.status(201).json(resource);
  } catch (error) {
    console.log("Error creating resource:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const group = await requireGroup(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { resourceId } = req.params;
    if (!isValidObjectId(resourceId)) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const resource = await GroupResource.findOneAndDelete({
      _id: resourceId,
      groupId: group._id,
    });

    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.log("Error deleting resource:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic role")
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error getting group messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    
    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "campusconnect/group-chat",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await GroupMessage.create({
      groupId,
      senderId: req.user._id,
      text: text?.trim() || "",
      image: imageUrl,
    });

    const populatedMessage = await GroupMessage.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic role"
    );

    io.to(`group_${groupId}`).emit("newGroupMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error sending group message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
