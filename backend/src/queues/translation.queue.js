import { Queue, QueueEvents, Worker } from "bullmq";
import { ENV } from "../lib/env.js";
import { runTranslationJob } from "../lib/translation.js";

const translationRedisUrl = (ENV.REDIS_URL || "").trim();
const translationQueueName = "translation";

const queueConnection = translationRedisUrl
  ? {
      url: translationRedisUrl,
      maxRetriesPerRequest: null,
    }
  : null;

let translationQueue;
let translationQueueEvents;
let translationWorker;

const getTranslationQueue = () => {
  if (!queueConnection) return null;
  if (!translationQueue) {
    translationQueue = new Queue(translationQueueName, { connection: queueConnection });
  }
  return translationQueue;
};

const getTranslationQueueEvents = async () => {
  if (!queueConnection) return null;

  if (!translationQueueEvents) {
    translationQueueEvents = new QueueEvents(translationQueueName, { connection: queueConnection });
    await translationQueueEvents.waitUntilReady();
  }

  return translationQueueEvents;
};

export const enqueueTranslationJob = async (payload) => {
  const queue = getTranslationQueue();
  if (!queue) return null;

  const mode = payload?.mode === "voice" ? "voice" : "text";
  return queue.add(mode === "voice" ? "translate-voice" : "translate-text", payload, {
    removeOnComplete: 100,
    removeOnFail: 50,
  });
};

export const processTranslationRequest = async (payload) => {
  const queue = getTranslationQueue();
  if (!queue) {
    return runTranslationJob(payload);
  }

  const job = await enqueueTranslationJob(payload);
  if (!job) {
    return runTranslationJob(payload);
  }

  const queueEvents = await getTranslationQueueEvents();
  return job.waitUntilFinished(queueEvents);
};

export const startJobWorkers = async () => {
  if (!queueConnection) {
    console.log("BullMQ worker disabled: REDIS_URL is not set.");
    return null;
  }

  if (translationWorker) {
    return translationWorker;
  }

  translationWorker = new Worker(
    translationQueueName,
    async (job) => runTranslationJob(job.data),
    { connection: queueConnection }
  );

  translationWorker.on("completed", (job) => {
    console.log(`Translation job completed: ${job.id}`);
  });

  translationWorker.on("failed", (job, error) => {
    console.log(`Translation job failed: ${job?.id || "unknown"}`, error?.message || error);
  });

  translationWorker.on("error", (error) => {
    console.log("BullMQ worker error:", error.message);
  });

  await translationWorker.waitUntilReady();
  console.log("BullMQ translation worker started");
  return translationWorker;
};
