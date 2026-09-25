import express from "express";
import {
  validateJobInput, createJob, getJob, listJobs
} from "../services/jobService.js";

export const jobRouter = express.Router();

jobRouter.post("/", async (req, res, next) => {
  try {
    validateJobInput(req.body);
    const idempotencyKey = req.header("Idempotency-Key");
    const result = await createJob({
      type: req.body.type,
      payload: req.body.payload || {},
      idempotencyKey
    });
    res.status(result.deduplicated ? 200 : 201).json(result);
  } catch (e) { next(e); }
});

jobRouter.get("/", async (req, res, next) => {
  try { res.json({ jobs: await listJobs(req.query.limit) }); }
  catch (e) { next(e); }
});

jobRouter.get("/:id", async (req, res, next) => {
  try {
    const job = await getJob(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ job });
  } catch (e) { next(e); }
});
