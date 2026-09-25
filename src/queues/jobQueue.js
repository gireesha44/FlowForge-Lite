import { Queue } from "bullmq";
import { connection } from "./redis.js";

export const JOB_QUEUE = "flowforge-jobs";

export const jobQueue = new Queue(JOB_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 1000,
    removeOnFail: 1000
  }
});
