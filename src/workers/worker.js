import { Worker } from "bullmq";
import { connection } from "../queues/redis.js";
import { JOB_QUEUE } from "../queues/jobQueue.js";
import { query } from "../db/pool.js";
import { executeJob } from "./handlers.js";
import { env } from "../config/env.js";

const worker = new Worker(JOB_QUEUE, async bullJob => {
  const { jobId } = bullJob.data;

  const result = await query(`SELECT * FROM jobs WHERE id=$1`, [jobId]);
  const job = result.rows[0];
  if (!job) throw new Error(`Persisted job ${jobId} not found`);

  await query(
    `UPDATE jobs SET status='RUNNING', attempts=attempts+1, started_at=COALESCE(started_at,NOW()), updated_at=NOW()
     WHERE id=$1`,
    [jobId]
  );

  try {
    const output = await Promise.race([
      executeJob(job.type, job.payload),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Job exceeded ${env.jobTimeoutMs}ms timeout`)), env.jobTimeoutMs)
      )
    ]);

    await query(
      `UPDATE jobs SET status='COMPLETED', result=$1, completed_at=NOW(), updated_at=NOW() WHERE id=$2`,
      [output, jobId]
    );

    return output;
  } catch (error) {
    const current = await query(`SELECT attempts, max_attempts FROM jobs WHERE id=$1`, [jobId]);
    const { attempts, max_attempts } = current.rows[0];

    if (attempts < max_attempts) {
      await query(
        `UPDATE jobs SET status='RETRYING', error=$1, updated_at=NOW() WHERE id=$2`,
        [error.message, jobId]
      );
    } else {
      await query(
        `UPDATE jobs SET status='FAILED', error=$1, completed_at=NOW(), updated_at=NOW() WHERE id=$2`,
        [error.message, jobId]
      );
    }
    throw error;
  }
}, {
  connection,
  concurrency: env.workerConcurrency,
  lockDuration: Math.max(env.jobTimeoutMs + 5000, 30000)
});

worker.on("completed", job => console.log(`[worker] completed ${job.id}`));
worker.on("failed", (job, err) => console.log(`[worker] failed ${job?.id}: ${err.message}`));
worker.on("error", err => console.error("[worker] error:", err));

console.log(`FlowForge worker online. concurrency=${env.workerConcurrency}`);

async function shutdown() {
  await worker.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
