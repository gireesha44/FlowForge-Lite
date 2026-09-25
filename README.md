# FlowForge

FlowForge is a small distributed job-processing service built around PostgreSQL, Redis, BullMQ and Node.js. The project includes an interactive engineering console so a reviewer can exercise the important behaviors without Postman.

## Five interactive tests

The home page is intentionally focused on five separate engineering capabilities:

1. **Successful Job** — creates a real `demo` job and watches `PENDING → RUNNING → COMPLETED`. The persisted attempt counter should become `1/3`.
2. **Retry & Failure** — creates one `unstable` job with `fail=true`. BullMQ retries the same persisted job. The PostgreSQL attempt counter moves across attempts until the job reaches `FAILED`.
3. **Timeout Handling** — creates a `sleep` job longer than the 15-second worker timeout. The timeout is treated as a failed execution and retried according to the configured maximum attempts.
4. **Idempotency** — sends two HTTP requests with the exact same `Idempotency-Key`. The second request returns the first job ID with `deduplicated=true`. The UI then follows that same job ID so the worker's attempts are visible on the same record.
5. **Concurrency** — submits multiple independent jobs in one burst. With `WORKER_CONCURRENCY=3`, up to three jobs can execute at once while the remaining jobs wait in the queue.

Each scenario accepts useful inputs and displays live server-backed results. The home page also contains a console-style activity feed and a table of persisted jobs.

## Run

```powershell
docker compose up -d
npm install
npm run db:init
npm run dev
```

In another terminal:

```powershell
npm run worker
```

Open `http://localhost:4000`.

## Environment

Copy `.env.example` to `.env` and configure PostgreSQL/Redis as needed. Typical values:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flowforge
REDIS_URL=redis://localhost:6379
PORT=4000
WORKER_CONCURRENCY=3
JOB_TIMEOUT_MS=15000
MAX_ATTEMPTS=3
```

## Implementation notes

- Idempotency is enforced by the unique `jobs.idempotency_key` constraint and `ON CONFLICT DO NOTHING`.
- Queue jobs are configured with `MAX_ATTEMPTS` and exponential backoff so worker exceptions result in real BullMQ retries.
- PostgreSQL `attempts` is incremented when the worker actually starts an execution attempt, so the same job ID can be followed across retries.
- Sleep handlers allow enough duration to demonstrate the configured 15-second timeout; normal jobs remain bounded at 60 seconds.
- The UI does not mock job results; it polls the API and renders the persisted database state.
