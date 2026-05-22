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
│  ├── routes/ (TODO: not yet created)        │
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
│  coasters via rcdb_id       │
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
- **Backend foundation is built**: server boots, health check works, DB + Redis connected, migrations all created, auth + error handler middlewares implemented
- **Routes are NOT yet implemented** — no route files exist yet (`/api/src/routes/` doesn't exist)
- **App (React Native)** — `/app` directory does not exist yet
- **Scraper** — n8n workflow JSON exists in `/scraper/rcdb-workflow.json` (spec complete)
