import { buildRedisKey, redisDelete, redisJsonGet, redisJsonSet } from "./redis.js";

const CACHE_TTL_SECONDS = 5 * 60;

const userByClerkIdCache = new Map();
const userByEmailCache = new Map();
const clerkProfileCache = new Map();

const now = () => Date.now();

const getValidEntry = (cache, key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setEntry = (cache, key, value) => {
  cache.set(key, {
    value,
    expiresAt: now() + CACHE_TTL_SECONDS * 1000,
  });
};

const stripToPlainUser = (user) => (user?.toObject ? user.toObject() : user);

const cacheKeys = {
  userByClerkId: (clerkId) => buildRedisKey("auth", "user", "clerk", clerkId),
  userByEmail: (email) => buildRedisKey("auth", "user", "email", email?.toLowerCase()),
  clerkProfile: (clerkId) => buildRedisKey("auth", "clerk-profile", clerkId),
};

const readOrFallback = async (redisKey, localCache, key) => {
  const cachedValue = await redisJsonGet(redisKey);
  if (cachedValue) return cachedValue;

  return getValidEntry(localCache, key);
};

const writeBothCaches = async (redisKey, localCache, key, value) => {
  setEntry(localCache, key, value);
  await redisJsonSet(redisKey, value, CACHE_TTL_SECONDS);
};

const deleteBothCaches = async (redisKeys, localCacheEntries = []) => {
  await redisDelete(redisKeys);
  for (const [cache, key] of localCacheEntries) {
    cache.delete(key);
  }
};

export const getCachedUserByClerkId = async (clerkId) => {
  if (!clerkId) return null;
  return readOrFallback(cacheKeys.userByClerkId(clerkId), userByClerkIdCache, clerkId);
};

export const getCachedUserByEmail = async (email) => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase();
  return readOrFallback(cacheKeys.userByEmail(normalizedEmail), userByEmailCache, normalizedEmail);
};

export const setCachedUser = async (user) => {
  const plainUser = stripToPlainUser(user);
  if (!plainUser) return;

  if (plainUser.clerkId) {
    const clerkKey = cacheKeys.userByClerkId(plainUser.clerkId);
    await writeBothCaches(clerkKey, userByClerkIdCache, plainUser.clerkId, plainUser);
  }

  if (plainUser.email) {
    const normalizedEmail = plainUser.email.toLowerCase();
    const emailKey = cacheKeys.userByEmail(normalizedEmail);
    await writeBothCaches(emailKey, userByEmailCache, normalizedEmail, plainUser);
  }
};

export const invalidateCachedUser = async ({ clerkId, email } = {}) => {
  const redisKeys = [];
  const localCacheEntries = [];

  if (clerkId) {
    redisKeys.push(cacheKeys.userByClerkId(clerkId));
    localCacheEntries.push([userByClerkIdCache, clerkId]);
  }

  if (email) {
    const normalizedEmail = email.toLowerCase();
    redisKeys.push(cacheKeys.userByEmail(normalizedEmail));
    localCacheEntries.push([userByEmailCache, normalizedEmail]);
  }

  await deleteBothCaches(redisKeys, localCacheEntries);
};

export const getCachedClerkProfile = async (clerkId) => {
  if (!clerkId) return null;
  return readOrFallback(cacheKeys.clerkProfile(clerkId), clerkProfileCache, clerkId);
};

export const setCachedClerkProfile = async (clerkId, profile) => {
  if (!clerkId || !profile) return;
  const redisKey = cacheKeys.clerkProfile(clerkId);
  await writeBothCaches(redisKey, clerkProfileCache, clerkId, profile);
};
