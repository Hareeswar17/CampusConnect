import express from "express";
import {
  acceptFriendRequest,
  deleteMessage,
  getDiscoverUsers,
  getAllContacts,
  getChatPartners,
  getFriendRequests,
  getMessagesByUserId,
  rejectFriendRequest,
  sendFriendRequest,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// the middlewares execute in order - so requests get rate-limited first, then authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware.
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/discover", getDiscoverUsers);
router.get("/requests", getFriendRequests);
router.post("/requests/:id", sendFriendRequest);
router.patch("/requests/:id/accept", acceptFriendRequest);
router.patch("/requests/:id/reject", rejectFriendRequest);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.delete("/:id", deleteMessage);

export default router;
