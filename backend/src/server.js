import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import webhookRoutes from "./routes/webhook.route.js";
import groupRoutes from "./routes/group.route.js";
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
app.use(express.json({ limit: "15mb" })); // req.body
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
app.use("/api/groups", groupRoutes);

// Serve frontend only when explicitly enabled (useful for single-service deploys).
const shouldServeStatic =
  ENV.NODE_ENV === "production" && String(ENV.SERVE_STATIC).toLowerCase() === "true";

if (shouldServeStatic) {
  const distPath = path.join(__dirname, "../frontend/dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    app.get("*", (_, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.warn("SERVE_STATIC enabled but frontend dist folder was not found.");
  }
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
