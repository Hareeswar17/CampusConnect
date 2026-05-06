import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import mongoose from "mongoose";
import { createClerkClient } from "@clerk/backend";
import { ENV } from "../lib/env.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");
const MIGRATIONS_COLLECTION = "_migrations";
const SKIP_SYNC_PATHS = new Set(["_id", "__v", "createdAt", "updatedAt"]);
const CLERK_PAGE_SIZE = 100;

const getPrimaryEmail = (clerkUser) => {
  const primaryEmailId = clerkUser.primaryEmailAddressId || clerkUser.primary_email_address_id;
  const emailAddresses = clerkUser.emailAddresses || clerkUser.email_addresses || [];

  const primary = emailAddresses.find((entry) => entry.id === primaryEmailId);
  return primary?.emailAddress || primary?.email_address || emailAddresses[0]?.emailAddress || emailAddresses[0]?.email_address || null;
};

const getClerkFullName = (clerkUser) => {
  const fullName = clerkUser.fullName || clerkUser.full_name;
  if (fullName) {
    return fullName;
  }

  const firstName = clerkUser.firstName || clerkUser.first_name || "";
  const lastName = clerkUser.lastName || clerkUser.last_name || "";
  const derived = `${firstName} ${lastName}`.trim();

  return derived || clerkUser.username || "User";
};

const normalizeClerkListResult = (result) => {
  if (Array.isArray(result)) {
    return { data: result, totalCount: result.length };
  }

  return {
    data: result?.data || [],
    totalCount: result?.totalCount ?? result?.total_count ?? null,
  };
};

const hasExplicitDefault = (schemaType) => schemaType.defaultValue !== undefined;

const resolveDefaultValue = (schemaType) => {
  const value = schemaType.defaultValue;
  return typeof value === "function" ? value() : value;
};

const buildMissingFieldFilter = (path) => {
  const filter = { [path]: { $exists: false } };

  if (!path.includes(".")) {
    return filter;
  }

  const parentPath = path.split(".").slice(0, -1).join(".");

  return {
    ...filter,
    $or: [
      { [parentPath]: { $exists: false } },
      { [parentPath]: { $type: "object" } },
    ],
  };
};

const syncModelDefaults = async (db, model) => {
  const collection = db.collection(model.collection.name);
  const operations = [];

  model.schema.eachPath((path, schemaType) => {
    if (SKIP_SYNC_PATHS.has(path) || !hasExplicitDefault(schemaType)) {
      return;
    }

    const defaultValue = resolveDefaultValue(schemaType);
    if (defaultValue === undefined) {
      return;
    }

    operations.push({
      updateMany: {
        filter: buildMissingFieldFilter(path),
        update: { $set: { [path]: defaultValue } },
      },
    });
  });

  if (operations.length === 0) {
    console.log(`- ${model.modelName}: no defaulted paths found to sync`);
    return;
  }

  const result = await collection.bulkWrite(operations, { ordered: false });
  const totalUpdated = Number(result.modifiedCount ?? result.result?.nModified ?? 0);
  console.log(
    `- ${model.modelName}: checked ${operations.length} path(s), updated ${totalUpdated} document(s)`
  );
};

const syncCurrentSchemas = async (db) => {
  console.log("Running automatic schema sync from current models...");
  const models = [User, Message];

  for (const model of models) {
    await syncModelDefaults(db, model);
  }
};

const syncUsersFromClerk = async () => {
  if (!ENV.CLERK_SECRET_KEY) {
    console.log("Skipping Clerk user sync (CLERK_SECRET_KEY is not configured).");
    return;
  }

  console.log("Syncing users from Clerk to MongoDB...");

  const clerkClient = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });
  let offset = 0;
  let synced = 0;
  let skippedNoEmail = 0;

  while (true) {
    const listResult = await clerkClient.users.getUserList({
      limit: CLERK_PAGE_SIZE,
      offset,
    });

    const { data, totalCount } = normalizeClerkListResult(listResult);
    if (!data.length) {
      break;
    }

    for (const clerkUser of data) {
      const clerkId = clerkUser.id;
      const email = getPrimaryEmail(clerkUser);
      const fullName = getClerkFullName(clerkUser);
      const profilePic = clerkUser.imageUrl || clerkUser.image_url || "";

      if (!clerkId || !email) {
        skippedNoEmail += 1;
        continue;
      }

      const existingByClerkId = await User.findOne({ clerkId });
      if (existingByClerkId) {
        existingByClerkId.email = email || existingByClerkId.email;
        existingByClerkId.fullName = fullName || existingByClerkId.fullName;
        existingByClerkId.profilePic = profilePic || existingByClerkId.profilePic;
        await existingByClerkId.save();
        synced += 1;
        continue;
      }

      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        existingByEmail.clerkId = clerkId;
        existingByEmail.fullName = fullName || existingByEmail.fullName;
        existingByEmail.profilePic = profilePic || existingByEmail.profilePic;
        await existingByEmail.save();
        synced += 1;
        continue;
      }

      await User.create({
        clerkId,
        email,
        fullName,
        password: null,
        profilePic,
      });
      synced += 1;
    }

    offset += data.length;

    if (typeof totalCount === "number" && offset >= totalCount) {
      break;
    }
  }

  console.log(`Clerk sync completed. Synced ${synced} user(s). Skipped ${skippedNoEmail} without email.`);
};

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

  await syncUsersFromClerk();
  await syncCurrentSchemas(db);

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
