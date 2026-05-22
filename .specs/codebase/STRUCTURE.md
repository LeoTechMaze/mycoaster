# STRUCTURE.md — MyCoaster

## Repository Layout

```
MyCoasterProject/
├── api/                          ← Backend (Node.js + Express)
│   ├── migrations/               ← Knex migration files (run in order)
│   │   ├── 20260515000001_create_users.js
│   │   ├── 20260515000002_create_parks.js
│   │   ├── 20260515000003_create_coasters.js
│   │   ├── 20260515000004_create_user_credits.js
│   │   ├── 20260515000005_create_reviews.js
│   │   ├── 20260515000006_create_photos.js
│   │   ├── 20260515000007_create_photo_likes.js
│   │   ├── 20260515000008_create_videos.js
│   │   └── 20260515000009_create_credit_trigger.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       ← knex instance (singleton)
│   │   │   ├── knexfile.js       ← knex config (connection, pool, migrations path)
│   │   │   └── redis.js          ← ioredis client (lazy connect, retry)
│   │   ├── middlewares/
│   │   │   ├── auth.js           ← JWT verify → req.user
│   │   │   └── errorHandler.js   ← Global Express error handler
│   │   └── index.js              ← App entry: middleware stack, health check, boot
│   └── package.json
│
├── app/                          ← React Native app (NOT YET CREATED)
│
├── scraper/
│   └── rcdb-workflow.json        ← n8n workflow export (importable into n8n)
│
├── docs/
│   ├── spec.md                   ← Product design spec (vision, features, scope)
│   ├── data-model.md             ← DB tables, triggers, badge thresholds, ai_summary format
│   ├── api.md                    ← REST endpoint reference
│   ├── plan.md                   ← Implementation phases (0–5) + priorities
│   ├── decisions.md              ← Technical decisions log
│   └── rcdb-n8n-scraper-spec.md  ← Detailed RCDB scraper spec for n8n
│
├── .specs/                       ← Spec-driven development docs (this skill)
│   ├── codebase/                 ← Brownfield mapping
│   └── project/                  ← Vision, roadmap, state
│
└── CLAUDE.md                     ← Project context for AI agents
```

## What's Built vs What's Not

| Area | Status |
|---|---|
| DB migrations (all 9) | ✅ Complete |
| Credit trigger (PL/pgSQL) | ✅ Complete |
| Express server bootstrap | ✅ Complete |
| Auth middleware (JWT) | ✅ Complete |
| Error handler middleware | ✅ Complete |
| DB config (knex) | ✅ Complete |
| Redis config (ioredis) | ✅ Complete |
| API routes (`/auth`, `/parks`, `/coasters`, etc.) | ❌ Not yet implemented |
| React Native app (`/app`) | ❌ Not yet started |
| n8n workflow (spec) | ✅ Spec complete, importable JSON exists |
| Object storage integration | ❌ Not yet decided (S3 vs R2) |
| AI batch job | ❌ Phase 4 — not yet built |
