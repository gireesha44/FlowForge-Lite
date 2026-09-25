import crypto from "node:crypto";
import { query } from "../db/pool.js";
import { jobQueue } from "../queues/jobQueue.js";
import { env } from "../config/env.js";

const allowedTypes = new Set(["demo", "cpu", "sleep", "unstable"]);

export function validateJobInput(body) {
  const type = body?.type;
  if (!allowedTypes.has(type)) {
    const err = new Error(`Unsupported job type. Use one of: ${[...allowedTypes].join(", ")}`);
    err.status = 400;
    throw err;
  }
  if (body?.payload !== undefined && (typeof body.payload !== "object" || body.payload === null)) {
    const err = new Error("payload must be a JSON object.");
    err.status = 400;
    throw err;
  }
}

export async function createJob({ type, payload = {}, idempotencyKey }) {
  const id = crypto.randomUUID();

  const inserted = await query(
    `INSERT INTO jobs (id, idempotency_key, type, payload, status, max_attempts)
     VALUES ($1,$2,$3,$4,'PENDING',$5)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [id, idempotencyKey || null, type, payload, env.maxAttempts]
  );

  let row = inserted.rows[0];

  if (!row && idempotencyKey) {
    const existing = await query(`SELECT * FROM jobs WHERE idempotency_key=$1`, [idempotencyKey]);
    row = existing.rows[0];
    return { job: row, deduplicated: true };
  }

  await jobQueue.add("execute", { jobId: row.id }, {
    jobId: row.id,
    attempts: env.maxAttempts,
    backoff: { type: "exponential", delay: 1000 }
  });

  return { job: row, deduplicated: false };
}

export async function getJob(id) {
  const result = await query(`SELECT * FROM jobs WHERE id=$1`, [id]);
  return result.rows[0] || null;
}

export async function listJobs(limit = 50) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const result = await query(
    `SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1`, [safeLimit]
  );
  return result.rows;
}

export async function updateJob(id, patch) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(patch)) {
    fields.push(`${key}=$${i++}`);
    values.push(value);
  }
  values.push(id);

  const result = await query(
    `UPDATE jobs SET ${fields.join(", ")}, updated_at=NOW() WHERE id=$${i} RETURNING *`,
    values
  );
  return result.rows[0];
}
