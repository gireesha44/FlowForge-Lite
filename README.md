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
```

---

## ✨ Core Features

### ⚙️ Asynchronous Job Processing

Jobs are submitted through a REST API and processed asynchronously by background workers.

### 🚦 Concurrency Control

Workers process multiple jobs concurrently while respecting a configurable concurrency limit.

### 🔁 Retry & Failure Handling

Failed jobs are retried up to a configured attempt limit with backoff.

### 🔐 Idempotency

Requests using the same idempotency key resolve to the same job instead of creating duplicate work.

### ⏱️ Timeout Handling

Long-running jobs are stopped when they exceed the configured execution timeout.

### 💾 Persistent Job State

PostgreSQL stores job status, attempts, results, errors, and timestamps.

### 📊 Interactive Dashboard

A lightweight dashboard lets users submit jobs and observe their real execution lifecycle without Postman.

---

## 🧪 Interactive Scenarios

The dashboard provides five focused demonstrations:

| Scenario | Demonstrates |
|---|---|
| Successful Job | Queue → Worker → Completion |
| Retry & Failure | Attempts → Retry → Failure |
| Timeout | Execution timeout + retry |
| Idempotency | Same key → Same job |
| Concurrency | Multiple jobs processed concurrently |

---

## 🏗️ Architecture

```text
                  ┌─────────────────┐
                  │  Dashboard UI   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Express API   │
                  └───────┬─────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │ PostgreSQL  │         │    Redis    │
       │ Job State   │         │   BullMQ    │
       └─────────────┘         └──────┬──────┘
                                      │
                                      ▼
                              ┌─────────────┐
                              │   Worker    │
                              │ Concurrency │
                              └──────┬──────┘
                                     │
                                     ▼
                              Job Execution
```

---

## 🛠️ Tech Stack

- **Node.js**
- **Express**
- **PostgreSQL**
- **Redis**
- **BullMQ**
- **Docker**
- **JavaScript**
- **HTML / CSS**

---

## ▶️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/gireesha44/flowforge-lite.git
cd flowforge-lite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL=your_postgresql_connection
REDIS_URL=your_redis_connection
PORT=4000
MAX_CONCURRENCY=3
MAX_ATTEMPTS=3
JOB_TIMEOUT_MS=15000
```

### 4. Start PostgreSQL and Redis

```bash
docker compose up -d
```

### 5. Start the API

```bash
npm run dev
```

### 6. Start the worker

Open another terminal:

```bash
npm run worker
```

Open the dashboard:

```text
http://localhost:4000
```

---

## 📌 Job Lifecycle

### Successful Job

```text
PENDING
   ↓
PROCESSING
   ↓
COMPLETED
```

### Failed Job

```text
PENDING
   ↓
PROCESSING
   ↓
FAILED
   ↓
RETRY
   ↓
PROCESSING
   ↓
COMPLETED / FAILED
```

---

## 🎯 Engineering Concepts Demonstrated

- Asynchronous job processing
- Queue-based architecture
- Background workers
- Concurrency management
- Idempotent APIs
- Retry and backoff strategies
- Timeout enforcement
- Fault handling
- Persistent job state
- REST API design
- Redis-based job queues
- Dockerized infrastructure

---

## 👩‍💻 Author

**Gireesha Pentakota**

Computer Science Engineering | VNRVJIET

GitHub: https://github.com/gireesha44
