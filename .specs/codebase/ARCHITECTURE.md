# ARCHITECTURE.md — MyCoaster

## System Overview

```
┌─────────────────────────────────────────────┐
│  React Native App (iOS + Android)           │
│  - Firebase Auth SDK                        │
│  - axios → REST API                         │
└─────────────────┬───────────────────────────┘
                  │ HTTPS + JWT
┌─────────────────▼───────────────────────────┐
│  Node.js + Express API                      │
│  src/index.js                               │
│  ├── helmet, cors, express.json             │
│  ├── /health  (DB + Redis ping)             │
│  ├── routes/index.js (scaffold, no logic)   │
│  ├── middlewares/auth.js (JWT verify)       │
│  └── middlewares/errorHandler.js            │
└──────┬──────────────┬──────────────────────-┘
       │              │
┌──────▼──────┐  ┌────▼──────┐
│ PostgreSQL  │  │  Redis    │
│ (knex)      │  │ (ioredis) │
│ Primary DB  │  │ Leaderboard│
└──────▲──────┘  └───────────┘
       │
┌──────┴──────────────────────┐
│  n8n Scraper (self-hosted)  │
│  Daily @ 03:00 UTC          │
│  RCDB → upsert parks +      │
│  coasters (name, location,  │
│  status) via rcdb_id        │
└─────────────────────────────┘
```

## Auth Flow
1. App signs in via Firebase Auth (Google/Apple/email)
2. App sends Firebase ID token to `POST /auth/login`
3. Server validates token via `firebase-admin`, creates/retrieves user record
4. Server returns own JWT (signed with `JWT_SECRET`)
5. App sends `Authorization: Bearer <token>` on subsequent requests
6. `authenticate` middleware verifies JWT, attaches `req.user = { id, email }`

## Data Flow: Credit + Badge
1. App calls `POST /credits` with `coaster_id`
2. API inserts row into `user_credits` (unique per user+coaster)
3. PostgreSQL trigger `trg_user_credits_sync` fires AFTER INSERT
4. Trigger increments `users.credit_count`, recalculates `badge_level`
5. Leaderboard cache in Redis is invalidated/updated
6. App reads updated profile and leaderboard on next fetch

## Geo Proximity Query Strategy
- No Google Maps API dependency
- `parks` table has `latitude` + `longitude` float columns
- Indexed via `idx_parks_lat_lng` for range filtering
- Distance calculated via Haversine formula or PostgreSQL `earth_distance` extension in query
- Coasters inherit park location for proximity (`/coasters?lat=&lng=&radius=`)

## AI Batch Pipeline (Phase 4 — not yet built)
- Cron job reads reviews for parks/coasters with ≥10 reviews
- Calls LLM API to generate `{ summary, tags, review_count, generated_at }`
- Saves result to `parks.ai_summary` or `coasters.ai_summary` (JSONB)
- App reads cached JSON — zero real-time AI calls

## Current State of the Codebase
- **Backend**: Phase 1 complete — all routes implemented (`/auth`, `/users`, `/parks`, `/coasters`, `/credits`, `/reviews`), ported to TypeScript (`apps/api/src`, tickets 6–7 of the monorepo migration)
- **Monorepo**: pnpm workspace (`apps/api`, `apps/app`, `packages/shared`) — see `.specs/project/ROADMAP.md`'s migration section for the full ticket history
- **`packages/shared`**: `@mycoaster/shared`, source-only TypeScript, Zod schemas consumed by both `apps/api` (via `tsconfig.base.json` path mapping + esbuild bundle) and `apps/app` (via Metro)
- **Staging live** — deployed on EasyPanel (PostgreSQL + Redis as services, API as app on `develop` branch)
- **App (React Native)** — `apps/app`, Expo SDK 57, all Phase 1 screens laid out; data layer not yet wired (reads from `mock-data.ts`)
- **Scraper** — n8n workflow JSON exists in `/scraper/rcdb-workflow.json`; Brazil scope populated
