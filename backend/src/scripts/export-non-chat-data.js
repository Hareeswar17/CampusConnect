import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { ENV } from "../lib/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORT_DIR = path.resolve(__dirname, "../../backups");
const EXCLUDED_COLLECTIONS = new Set(["messages"]);

const buildTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const run = async () => {
  if (!ENV.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(ENV.MONGO_URI);
  const db = mongoose.connection.db;

  const allCollections = await db.listCollections({}, { nameOnly: true }).toArray();
  const exportCollections = allCollections
    .map((entry) => entry.name)
    .filter((name) => !EXCLUDED_COLLECTIONS.has(name) && !name.startsWith("system."))
    .sort();

  await fs.mkdir(EXPORT_DIR, { recursive: true });

  const timestamp = buildTimestamp();
  const outputPath = path.join(EXPORT_DIR, `non-chat-export-${timestamp}.json`);

  const payload = {
    createdAt: new Date().toISOString(),
    database: db.databaseName,
    excludedCollections: Array.from(EXCLUDED_COLLECTIONS),
    collections: {},
  };

  for (const name of exportCollections) {
    const docs = await db.collection(name).find({}).toArray();
    payload.collections[name] = docs;
    console.log(`- Exported ${name}: ${docs.length} document(s)`);
  }

  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");

  console.log("Non-chat export completed.");
  console.log(`File: ${outputPath}`);
};

run()
  .catch((error) => {
    console.error("Export failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
