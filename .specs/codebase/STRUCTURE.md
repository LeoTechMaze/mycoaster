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
│   │   ├── 20260515000009_create_credit_trigger.js
│   │   ├── 20260522000001_add_status_to_parks.js
│   │   ├── 20260522000002_update_parks_status_add_sbno.js
│   │   └── 20260522000003_add_status_to_coasters.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       ← knex instance (singleton)
│   │   │   ├── env.js            ← Zod env validation — process.exit(1) on missing required vars
│   │   │   ├── firebase.js       ← Firebase Admin SDK init (graceful warn if unconfigured)
│   │   │   ├── knexfile.js       ← knex config (connection, pool, migrations/seeds path)
│   │   │   └── redis.js          ← ioredis client (lazy connect, retry, ACL user support)
│   │   ├── middlewares/
│   │   │   ├── auth.js           ← JWT verify → req.user
│   │   │   ├── errorHandler.js   ← Global Express error handler
│   │   │   └── validate.js       ← Zod validation middleware factory (body/query/params)
│   │   ├── routes/
│   │   │   └── index.js          ← Central router (Phase 1 route stubs, commented)
│   │   ├── utils/
│   │   │   └── response.js       ← success() helper → { data, meta? } envelope
│   │   └── index.js              ← App entry: env validation, Firebase init, Morgan, routes, boot
│   └── package.json
│
├── app/                          ← Expo app (React Native + TypeScript)
│   ├── app.json                  ← Expo config
│   ├── package.json              ← main: expo-router/entry
│   ├── assets/images/tabIcons/   ← template PNGs for NativeTabs
│   ├── design_handoff_mycoaster/ ← source design handoff
│   └── src/
│       ├── app/                  ← expo-router file-based routes
│       │   ├── _layout.tsx       ← root: fonts, ThemeProvider, splash, AppStack
│       │   ├── (tabs)/           ← index (Home), explore, ranks, profile
│       │   ├── park/[id].tsx     ← park detail (Coasters | Reviews | Photos)
│       │   ├── coaster/[id].tsx  ← coaster detail
│       │   ├── login/index.tsx   ← auth screen (onboarding step 3)
│       │   ├── tutorial/         ← onboarding steps 1 and 2
│       │   ├── log-ride.tsx      ← formSheet modal (no entry point yet)
│       │   └── review-composer.tsx ← formSheet modal
│       ├── components/
│       │   ├── app-stack.tsx     ← Stack config + sheet presentations
│       │   ├── app-tabs.tsx      ← NativeTabs config
│       │   └── ui/               ← shared layout components
│       ├── constants/
│       │   ├── theme.ts          ← Brand, Colors light/dark, Radii, Shadows, FontFamily
│       │   └── mock-data.ts      ← static placeholder content (to be replaced by API)
│       └── hooks/                ← use-theme, use-color-scheme
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
| DB migrations (all 12) | ✅ Complete |
| Credit trigger (PL/pgSQL) | ✅ Complete |
| Express server bootstrap | ✅ Complete |
| Auth middleware (JWT) | ✅ Complete |
| Error handler middleware | ✅ Complete |
| DB config (knex) | ✅ Complete |
| Redis config (ioredis) | ✅ Complete |
| API route scaffold (`routes/index.js`) | ✅ Complete (stubs only, no logic) |
| API route logic (`/auth`, `/parks`, `/coasters`, etc.) | ❌ Not yet implemented |
| Expo app scaffold (`/app`) | ✅ Complete — Expo SDK 57, expo-router, TypeScript |
| App screens (layout) | ✅ Complete — all Phase 1 screens plus ranks/photos/AI summary from later phases |
| App data layer (HTTP client, auth, API wiring) | ❌ Not started — every screen reads from `src/constants/mock-data.ts` |
| App Firebase Auth + JWT storage | ❌ Not started |
| n8n workflow (spec) | ✅ Spec complete, importable JSON exists |
| Object storage integration | ❌ Not yet decided (S3 vs R2) |
| AI batch job | ❌ Phase 4 — not yet built |
