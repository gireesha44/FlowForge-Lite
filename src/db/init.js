import fs from "node:fs/promises";
import { pool } from "./pool.js";

const sql = await fs.readFile(new URL("./schema.sql", import.meta.url), "utf8");
await pool.query(sql);
console.log("FlowForge database initialized.");
await pool.end();
