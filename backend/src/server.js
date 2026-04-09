import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import webhookRoutes from "./routes/webhook.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
const configuredClientOrigin = ENV.CLIENT_URL;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === configuredClientOrigin) return true;

  // In development Vite may move between 5173/5174/etc. if ports are occupied.
  if (ENV.NODE_ENV === "development" && /^http:\/\/localhost:\d+$/.test(origin)) {
    return true;
  }

  return false;
};

app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "5mb" })); // req.body
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(clerkMiddleware());

app.use("/api/webhooks", webhookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
