# Patient Visit Tracker

A small full-stack app for tracking patient visits by clinicians, built for the Woundtech take-home
project.

- **Backend:** Node.js, Express, TypeScript, TypeORM, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Database:** [Neon](https://neon.tech) (hosted Postgres only — no local database container)
- **Infra:** Docker Compose (API + static frontend behind nginx)

The backend talks to Neon through TypeORM using [`@neondatabase/serverless`](https://github.com/neondatabase/serverless)
over WebSockets (port 443). That is required on Docker Desktop, where Neon’s TCP `5432` path
often fails (`ETIMEDOUT` / `ENETUNREACH` on IPv6). There is no local-Postgres fallback.

## Prerequisites

- A free [Neon](https://neon.tech) Postgres account — required either way; there is no local
  Postgres fallback.
- **Docker Desktop** (bundles Docker Compose v2, invoked as `docker compose`) for the recommended
  setup below, **or** **Node.js 20+** and **npm** to run the backend and frontend directly.

## Quick start (Docker - recommended)

1. Sign up at [console.neon.tech](https://console.neon.tech/signup) (GitHub/Google/email, free
   tier, no card required), create a project, and copy the **pooled** connection string shown
   under **Connect to your database** (enable the Connection pooling toggle). It looks like:

   `postgres://<user>:<password>@ep-xxxx-xxxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require`

2. Copy `.env.example` to `.env` in the project root and set `DATABASE_URL` to that string.
   Keep `sslmode=require` (and `channel_binding=require` if Neon includes it). Adding
   `connect_timeout=15` is recommended so a cold Neon compute has time to wake.

3. ```bash
   docker compose up --build
   ```

On first boot the backend container runs migrations against Neon and seeds demo clinicians,
patients, and visits (`SEED_DB=true` by default) so the UI isn’t empty.

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api

To stop: `Ctrl+C`, then `docker compose down`.

### Environment variables

Set these in the **project-root** `.env` (Compose reads that file). `backend/.env` is only
used when you run the API on the host with `npm run dev`.

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | root `.env` (required) | Neon Postgres connection string |
| `SEED_DB` | root `.env` | `true` (default) seeds demo data on boot |
| `BACKEND_PORT` | root `.env` | Host port for the API (default `4000`) |
| `FRONTEND_PORT` | root `.env` | Host port for the UI (default `5173`) |
| `CORS_ORIGIN` | root `.env` | Allowed browser origin (default `http://localhost:5173`) |

`frontend/.env` is optional. Same-origin `/api` works via the Vite proxy and the nginx proxy
in Docker, so you do not need `VITE_API_URL` unless you want a different API host.

### Why WebSockets (not TCP 5432)

Neon publishes IPv6 (`AAAA`) records. Docker Desktop on Mac advertises IPv6 inside containers
but cannot route it, so Node’s default Happy Eyeballs connect fails with `ENETUNREACH` and can
then time out IPv4 on port `5432`.

The app avoids that path entirely:

- TypeORM uses `@neondatabase/serverless` + `ws` (`backend/src/config/data-source.ts`)
- Connections go to Neon over **WSS on port 443**
- Node is also forced to prefer IPv4 (`NODE_OPTIONS=--dns-result-order=ipv4first`, plus
  `dns.setDefaultResultOrder("ipv4first")` in code)

Neon’s free tier also suspends an idle compute after a few minutes and wakes it on the next
connection. The first request after idle can take a couple of extra seconds; `connect_timeout=15`
and a 20s pool timeout cover that.

## Running locally without Docker

Needs Node.js 20+, npm, and a Neon connection string (see Prerequisites and step 1 of Quick
start above if you don’t have one yet). `DATABASE_URL` is required — there is no local Postgres
install or Compose `db` service.

### 1. Backend

```bash
cd backend
cp .env.example .env   # then set DATABASE_URL to your Neon connection string
npm install
npm run migration:run  # creates the schema on Neon
npm run seed            # optional: adds demo data
npm run dev              # starts the API on http://localhost:4000
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173.

### Running backend tests

```bash
cd backend
npm test
```

## Project structure

```
backend/
  src/
    config/           env + TypeORM DataSource (Neon serverless / WebSocket)
    entities/         TypeORM entities: Clinician, Patient, Visit
    migrations/       Hand-written SQL migration (schema, indexes, FKs)
    schemas/          Zod request-validation schemas
    services/         Business logic (incl. the transactional visit-creation flow)
    controllers/      Thin request/response glue
    routes/           Express route definitions
    middleware/       Centralized error handling
    seed.ts           Demo-data seed script
  docker-entrypoint.sh  Runs migrations (+ optional seed), then starts the API
frontend/
  src/
    api/              Typed axios wrappers per resource
    hooks/            TanStack Query hooks (fetching, caching, mutations)
    components/       UI: Header, PeoplePanel, VisitForm, VisitsTable, ui/ primitives
.env.example          Root Compose env template (DATABASE_URL required)
docker-compose.yml    Backend + frontend only; backend connects out to Neon
```

## Data model

Three tables, created by `backend/src/migrations/1732000000000-InitSchema.ts`:

- **clinicians** - `id, name, specialty, lastVisitAt, createdAt`
- **patients** - `id, name, dateOfBirth, lastVisitAt, createdAt`
- **visits** - `id, clinician_id, patient_id, visitDate, notes, createdAt`, with foreign keys to
  both `clinicians` and `patients` (`ON DELETE RESTRICT`, so a clinician/patient with recorded
  visits can't be silently orphaned).

Indexes: `(clinician_id, visitDate DESC)` and `(patient_id, visitDate DESC)` back the two filtered
visit-list queries, and `(visitDate DESC)` backs the unfiltered one - all three read paths the
frontend actually uses stay index-only as the table grows.

## API

| Method | Path                                          | Description                                  |
| --- | --- | --- |
| GET    | `/api/clinicians`                          | List clinicians, alphabetical                |
| POST   | `/api/clinicians`                          | Create a clinician                             |
| GET    | `/api/patients`                              | List patients, alphabetical                    |
| POST   | `/api/patients`                              | Create a patient                                |
| GET    | `/api/visits`                                  | List visits, most recent first                 |
| GET    | `/api/visits?clinicianId=&patientId=`  | Same, filtered by clinician and/or patient |
| POST   | `/api/visits`                                  | Record a visit (see transaction note below)  |

All request bodies are validated with [Zod](https://zod.dev); a validation failure returns `400`
with a `{ error: { message, details } }` body. A reference to a nonexistent clinician/patient
returns `404` (checked explicitly) or `400` (if a race slips past that check and hits the foreign
key instead - both paths are handled).

## Why a transaction, and where

`POST /api/visits` (`backend/src/services/visits.service.ts`) does three things: insert the visit
row, and update a denormalized `lastVisitAt` timestamp on both the clinician and the patient. All
three writes happen inside a single `AppDataSource.transaction(...)` block, with the clinician and
patient rows locked (`pessimistic_write`) for the duration:

- **Atomicity** - if the visit insert fails validation at the DB level (e.g. the FK constraint),
  nothing is left partially written; the `lastVisitAt` updates never happen either.
- **No lost updates under concurrency** - if two visits for the same clinician land at nearly the
  same time, the row lock ensures they don't race to write `lastVisitAt` and leave it pointing at
  the older visit.

`lastVisitAt` is denormalized on purpose: it lets the clinician/patient list panels show "last
seen" without an aggregate query per row. The transaction is what keeps that cache honest.

The seed script (`backend/src/seed.ts`) reuses this same service method, so the demo data goes
through the exact same code path as the UI.

## Frontend notes

- **TanStack Query** handles all server-state (fetching, caching, invalidation) - creating a visit
  invalidates the visits list *and* the clinician/patient lists, since `lastVisitAt` on those
  changes too.
- **React Hook Form + Zod** validate the visit form client-side before it ever hits the network.
- The dev server proxies `/api` to the backend (`vite.config.ts`), and the Docker frontend image
  does the same via nginx (`frontend/nginx.conf`) - so the same relative API path works in both
  environments with no CORS configuration needed.
- Filtering by clinician/patient is server-side (`GET /api/visits?clinicianId=...`), not a
  client-side array filter, so it stays correct if the visit list is ever paginated later.
