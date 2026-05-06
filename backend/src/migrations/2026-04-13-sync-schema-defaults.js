import Message from "../models/Message.js";
import User from "../models/User.js";

const SKIP_PATHS = new Set(["_id", "__v", "createdAt", "updatedAt"]);

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

  // Avoid update errors when the parent exists but is null or a non-object value.
  return {
    ...filter,
    $or: [
      { [parentPath]: { $exists: false } },
      { [parentPath]: { $type: "object" } },
    ],
  };
};

const applySchemaDefaults = async (db, model) => {
  const collection = db.collection(model.collection.name);
  const operations = [];

  model.schema.eachPath((path, schemaType) => {
    if (SKIP_PATHS.has(path) || !hasExplicitDefault(schemaType)) {
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

export const up = async (db) => {
  const models = [User, Message];

  for (const model of models) {
    await applySchemaDefaults(db, model);
  }
};
