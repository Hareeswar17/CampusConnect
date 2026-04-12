import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import mongoose from "mongoose";
import { ENV } from "../lib/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");
const MIGRATIONS_COLLECTION = "_migrations";

const loadMigrationFiles = async () => {
  const dirEntries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });

  return dirEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => entry.name)
    .sort();
};

const run = async () => {
  if (!ENV.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(ENV.MONGO_URI);
  const db = mongoose.connection.db;
  const migrations = db.collection(MIGRATIONS_COLLECTION);

  await migrations.createIndex({ name: 1 }, { unique: true });

  const files = await loadMigrationFiles();
  console.log(`Found ${files.length} migration file(s).`);

  for (const fileName of files) {
    const existing = await migrations.findOne({ name: fileName });
    if (existing) {
      console.log(`- Skipping ${fileName} (already applied)`);
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, fileName);
    const migrationModule = await import(pathToFileURL(filePath).href);

    if (typeof migrationModule.up !== "function") {
      throw new Error(`Migration ${fileName} does not export an up function`);
    }

    console.log(`- Applying ${fileName}`);
    await migrationModule.up(db);
    await migrations.insertOne({
      name: fileName,
      appliedAt: new Date(),
    });
    console.log(`  Applied ${fileName}`);
  }

  console.log("Migration run completed.");
};

run()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
