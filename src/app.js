import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import pinoHttp from "pino-http";
import { jobRouter } from "./routes/jobRoutes.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "flowforge-api" }));
app.use("/api/jobs", jobRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});
