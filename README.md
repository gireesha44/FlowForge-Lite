# ⚡ FlowForge Lite

### Distributed Job Processing Platform

FlowForge Lite is a lightweight backend-focused job processing system built with **Node.js, Express, PostgreSQL, Redis, and BullMQ**.

It demonstrates practical backend and distributed-systems concepts including **asynchronous job processing, concurrency, idempotency, retries, timeout handling, background workers, and persistent job state**.

---

## 🚀 Overview

FlowForge Lite separates **job submission** from **job execution**.

```text
Client
  │
  ▼
Express API
  │
  ├──────────────► PostgreSQL
  │                 Job State
  │
  ▼
Redis + BullMQ
  │
  ▼
Background Worker
  │
  ▼
Execute → Retry / Timeout → Result
