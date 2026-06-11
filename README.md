# Handover Shift Notes

A proof-of-concept full-stack application for hotel shift handover notes.

The app helps front-desk staff keep handover tasks consistent across shifts, especially when notes come from a mix of structured system events and free-text notes written during downtime.

## What it does

- Staff signup and login.
- View open handover tasks first, sorted by computed priority.
- Add structured handover notes manually.
- Reconcile free-text shift notes into structured event records using OpenRouter.
- Normalize multilingual notes into English during reconciliation.
- Select the source-of-truth shift for reconciled notes using:
  - shift start date: `yyyy-mm-dd`
  - shift kind: `day`, `night`, or `morning`
  - resulting shift ID: `yyyy-mm-dd-day`, `yyyy-mm-dd-night`, or `yyyy-mm-dd-morning`
- Override task priority when AI/computed priority is wrong.
- Add task thread history for follow-up, resolution, or unresolved updates.
- Resolve a task with a short message and optional image attachment.
- Store thread images in AWS S3.
- Protect the API with configurable sliding-window rate limiting backed by Redis/Valkey.

## Tech stack

### Backend

- TypeScript
- Hono
- PostgreSQL
- Redis/Valkey
- OpenRouter for free-text reconciliation
- AWS S3 for thread image attachments

### Frontend

- SvelteKit static site
- TypeScript

## Project structure

```text
backend/       Hono API, migrations, services, tests
frontend/      SvelteKit static frontend
shared/        Shared Zod schemas and TypeScript types
sample/        Sample structured events and free-text night log
```

## Local prerequisites

- Node.js and npm
- Docker
- Local Postgres and Redis/Valkey containers
- Optional: AWS credentials for testing image upload to S3
- Optional: OpenRouter API key for testing reconciliation

## Install dependencies

```bash
npm install --package-lock-only=false
```


## About `.npmrc` and dependency installation

This repository intentionally includes a restrictive `.npmrc` to reduce supply-chain risk during day-to-day work:

```ini
allow-git=none
allow-remote=none
save-exact=true
min-release-age=5
prefer-offline=true
prefer-dedupe=true
init-private=true
ignore-scripts=true
package-lock-only=true
```

The important consequence is `package-lock-only=true`: a plain `npm install` updates/checks the lockfile but does **not** install `node_modules`.

Use this command when you actually need local dependencies installed:

```bash
npm install --package-lock-only=false
```

For a clean CI/deploy install, use:

```bash
npm ci --package-lock-only=false
```

Keep `ignore-scripts=true` unless a dependency genuinely requires lifecycle scripts. If you must allow scripts for a one-off trusted install, make it explicit:

```bash
npm ci --package-lock-only=false --ignore-scripts=false
```

Do not remove the restrictive defaults casually; prefer explicit per-command overrides so risky install behavior is visible in shell history and deployment config.

## Environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Important backend variables:

```env
PORT=8787
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-in-production
CORS_ORIGIN=http://localhost:5173
HOTEL_ID=lumen-sg
HOTEL_TIMEZONE=+08:00
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=handover-shift-notes-ky64-poc
S3_PUBLIC_BASE_URL=
```

Important frontend variable:

```env
VITE_API_BASE_URL=http://localhost:8787
```

`OPENROUTER_API_KEY` can be left empty unless you are testing free-text reconciliation.

## Start local infrastructure

The expected local Docker container names are `postgres` and `redis`:

```bash
docker start postgres redis
```

Check containers if needed:

```bash
docker ps -a
```

## Database setup

Run migrations:

```bash
npm run db:migrate
```

Seed sample events:

```bash
npm run db:seed
```

The seed data comes from `sample/events.json`.

## Run locally

Start backend:

```bash
npm run dev:backend
```

Start frontend in another terminal:

```bash
npm run dev:frontend
```

Then open the local frontend shown by Vite, usually:

```text
http://localhost:5173
```

## Local test flow

1. Start Postgres and Redis/Valkey.
2. Run migrations and seed data.
3. Start backend and frontend.
4. Open the frontend.
5. Signup or login.
6. Confirm the handover page shows seeded open tasks first.
7. Change a task priority from the dropdown.
8. Click **Resolve** or **Add thread**.
9. Add a short thread message.
10. Optionally attach an image if AWS credentials and S3 bucket are configured.
11. Confirm the thread appears in task history.
12. Open a resolved task and confirm its thread is still viewable.

## Reconciliation flow

To test free-text reconciliation:

1. Set `OPENROUTER_API_KEY` in the backend environment.
2. Start the backend.
3. Open `/reconcile` in the frontend.
4. Enter:
   - shift start date, e.g. `2026-05-27`
   - shift kind, e.g. `night`
   - free-text notes from `sample/night-logs.md`
5. Submit the form.
6. Confirm structured events are auto-written and visible in the handover task list.

The staff-selected shift ID is the source of truth for reconciled notes. Model-inferred timestamps are stored on the event, but `shift_id` and `business_date` come from the reconciliation form.

### Generate handover via curl

Fetch the current handover task list:

```bash
curl http://localhost:8787/events
```

Filter by status or room:

```bash
# Only unresolved tasks
curl "http://localhost:8787/events?status=unresolved"

# Tasks for a specific room
curl "http://localhost:8787/events?room=205"

# Combine filters
curl "http://localhost:8787/events?status=pending&room=310"
```

Valid `status` values: `resolved`, `unresolved`, `pending`.

The response returns all matching events sorted by priority (`critical` > `high` > `medium` > `low`), with tie-breaks by timestamp. No authentication is required for this endpoint.

## Verification commands

Build everything:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Backend-only build:

```bash
npm run build --workspace @handover/backend
```

Frontend-only build:

```bash
npm run build --workspace @handover/frontend
```

## Notes

- The app is a POC and uses simple email/password authentication with JWT bearer tokens.
- There are no roles yet; every authenticated staff user can create/update tasks and threads.
- Free-text reconciliation auto-writes extracted events, but raw notes and model output are preserved for auditability.
- The UI is intentionally light-mode only, minimal, and formal for institutional use.
