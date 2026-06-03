import { createClient } from "redis";
import { ENV } from "./env.js";

const REDIS_TTL_SECONDS = 5 * 60;

let redisClient;
let connectPromise;

const isRedisConfigured = Boolean((ENV.REDIS_URL || "").trim());

export const redisKeyPrefix = (ENV.REDIS_KEY_PREFIX || "campusconnect").trim() || "campusconnect";

export const buildRedisKey = (...parts) =>
  [redisKeyPrefix, ...parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean)].join(":");

const createRedisClient = () => {
  if (!isRedisConfigured) return null;

  const client = createClient({ url: ENV.REDIS_URL.trim() });
  client.on("error", (error) => {
    console.log("Redis Client Error:", error.message);
  });

  return client;
};

export const getRedisClient = async () => {
  if (!isRedisConfigured) return null;

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisClient) {
    redisClient = createRedisClient();
  }

  if (!redisClient) return null;

  if (!connectPromise) {
    connectPromise = redisClient
      .connect()
      .then(() => redisClient)
      .finally(() => {
        connectPromise = null;
      });
  }

  await connectPromise;
  return redisClient;
};

export const redisJsonGet = async (key) => {
  const client = await getRedisClient();
  if (!client) return null;

  const rawValue = await client.get(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

export const redisJsonSet = async (key, value, ttlSeconds = REDIS_TTL_SECONDS) => {
  const client = await getRedisClient();
  if (!client) return false;

  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  return true;
};

export const redisDelete = async (...keys) => {
  const client = await getRedisClient();
  if (!client || keys.length === 0) return 0;

  return client.del(keys.flat().filter(Boolean));
};

export const redisSAdd = async (key, ...members) => {
  const client = await getRedisClient();
  if (!client || members.length === 0) return 0;

  return client.sAdd(key, members.flat().filter(Boolean).map((member) => String(member)));
};

export const redisSRem = async (key, ...members) => {
  const client = await getRedisClient();
  if (!client || members.length === 0) return 0;

  return client.sRem(key, members.flat().filter(Boolean).map((member) => String(member)));
};

export const redisSMembers = async (key) => {
  const client = await getRedisClient();
  if (!client) return [];

  return client.sMembers(key);
};

export const redisTTLSeconds = REDIS_TTL_SECONDS;
