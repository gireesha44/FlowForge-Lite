import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

const isLocalDatabase =
  env.databaseUrl.includes("localhost") ||
  env.databaseUrl.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: env.databaseUrl,

  // Render PostgreSQL requires SSL.
  // Local Docker PostgreSQL does not.
  ssl: isLocalDatabase
    ? false
    : {
        rejectUnauthorized: false,
      },

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}