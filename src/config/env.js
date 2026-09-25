import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY || 3),
  jobTimeoutMs: Number(process.env.JOB_TIMEOUT_MS || 15000),
  maxAttempts: Number(process.env.MAX_ATTEMPTS || 3)
};

if (!env.databaseUrl) {
  console.warn("DATABASE_URL is not configured. API starts only after DB is available.");
}
