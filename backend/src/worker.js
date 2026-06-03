import { startJobWorkers } from "./queues/translation.queue.js";

const worker = await startJobWorkers();

if (!worker) {
  console.log("No BullMQ worker started.");
  process.exit(0);
}

const shutdown = async () => {
  try {
    await worker.close();
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
