# STRUCTURE.md — MyCoaster

## Repository Layout

```
MyCoasterProject/
├── apps/
│   ├── api/                          ← Backend (Node.js + Express, TypeScript)
│   │   ├── migrations/               ← Knex migration files (run in order, still .js — see CONVENTIONS.md)
│   │   │   ├── 20260515000001_create_users.js
│   │   │   ├── 20260515000002_create_parks.js
│   │   │   ├── 20260515000003_create_coasters.js
│   │   │   ├── 20260515000004_create_user_credits.js
│   │   │   ├── 20260515000005_create_reviews.js
│   │   │   ├── 20260515000006_create_photos.js
│   │   │   ├── 20260515000007_create_photo_likes.js
│   │   │   ├── 20260515000008_create_videos.js
│   │   │   ├── 20260515000009_create_credit_trigger.js
│   │   │   ├── 20260522000001_add_status_to_parks.js
│   │   │   ├── 20260522000002_update_parks_status_add_sbno.js
│   │   │   └── 20260522000003_add_status_to_coasters.js
│   │   ├── seeds/                    ← Knex seed fixtures, still .js (same as migrations)
│   │   ├── tests/                    ← Jest/Supertest, deliberately kept .js (safety net, see TESTING.md)
│   │   ├── src/                      ← all TypeScript (ported from JS — see ROADMAP.md tickets 6–7)
│   │   │   ├── config/
│   │   │   │   ├── database.ts       ← knex instance (singleton)
│   │   │   │   ├── env.ts            ← Zod env validation — process.exit(1) on missing required vars
│   │   │   │   ├── firebase.ts       ← Firebase Admin SDK init (graceful warn if unconfigured)
│   │   │   │   ├── knexfile.ts       ← knex config (connection, pool, migrations/seeds path)
│   │   │   │   └── redis.ts          ← ioredis client (lazy connect, retry, ACL user support)
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts           ← JWT verify → req.user
│   │   │   │   ├── errorHandler.ts   ← Global Express error handler
│   │   │   │   └── validate.ts       ← Zod validation middleware factory (body/query/params)
│   │   │   ├── routes/
│   │   │   │   ├── index.ts          ← Central router
│   │   │   │   ├── auth.ts           ← POST /auth/login (Firebase token → internal JWT)
│   │   │   │   ├── users.ts          ← GET /users/:id, PATCH /users/me
│   │   │   │   ├── parks.ts          ← GET /parks (geo + text search), GET /parks/:id(/coasters)
│   │   │   │   ├── coasters.ts       ← GET /coasters (geo + text search), GET /coasters/:id
│   │   │   │   ├── credits.ts        ← POST/DELETE /credits, GET /credits/me
│   │   │   │   └── reviews.ts        ← POST /reviews, PUT /reviews/:id, cursor-paginated listings
│   │   │   ├── types/
│   │   │   │   └── express.d.ts      ← Request augmentation (req.user, req.validated)
│   │   │   ├── utils/
│   │   │   │   ├── response.ts       ← success() helper → { data, meta? } envelope
│   │   │   │   └── search.ts         ← geo/text list query schema, haversine + avg-rating SQL
│   │   │   ├── app.ts                ← Express app: middleware stack, routes, /health, error handler
│   │   │   └── index.ts              ← Entry point: dotenv, boots app.listen
│   │   └── package.json              ← name: @mycoaster/api
│   │
│   └── app/                          ← Expo app (React Native + TypeScript)
│       ├── app.json                  ← Expo config
│       ├── package.json              ← name: @mycoaster/app, main: expo-router/entry
│       ├── assets/images/tabIcons/   ← template PNGs for NativeTabs
│       ├── design_handoff_mycoaster/ ← source design handoff
│       └── src/
│           ├── app/                  ← expo-router file-based routes
│           │   ├── _layout.tsx       ← root: fonts, ThemeProvider, splash, AppStack
│           │   ├── (tabs)/           ← index (Home), explore, ranks, profile
│           │   ├── park/[id].tsx     ← park detail (Coasters | Reviews | Photos)
│           │   ├── coaster/[id].tsx  ← coaster detail
│           │   ├── login/index.tsx   ← auth screen (onboarding step 3)
│           │   ├── tutorial/         ← onboarding steps 1 and 2
│           │   ├── log-ride.tsx      ← formSheet modal (no entry point yet)
│           │   └── review-composer.tsx ← formSheet modal
│           ├── components/
│           │   ├── app-stack.tsx     ← Stack config + sheet presentations
│           │   ├── app-tabs.tsx      ← NativeTabs config
│           │   └── ui/               ← shared layout components
│           ├── constants/
│           │   ├── theme.ts          ← Brand, Colors light/dark, Radii, Shadows, FontFamily
│           │   └── mock-data.ts      ← static placeholder content (to be replaced by API)
│           ├── hooks/                ← use-theme, use-color-scheme
│           └── lib/
│               └── shared-resolution-proof.ts ← imports Coaster from @mycoaster/shared, side-effect only (imported by _layout.tsx) — proves Metro bundles the shared package
│
├── packages/
│   └── shared/                       ← @mycoaster/shared — source-only TypeScript (no dist/), consumed by both apps
│       ├── package.json              ← name: @mycoaster/shared, main/types → src/index.ts, zod as a pinned peer dependency
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts              ← barrel
│           └── schemas/
│               ├── coaster.ts        ← Coaster/CoasterSchema (id, name) — resolution-proof placeholder, not the full DB shape
│               └── uuid.ts           ← UUID_RE, uuid, uuidParams (moved from apps/api/src/utils/schemas.js in ticket 7)
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
| API route logic (`/auth`, `/users`, `/parks`, `/coasters`, `/credits`, `/reviews`) | ✅ Complete — all Phase 1 endpoints implemented |
| API TypeScript port (`apps/api/src`) | ✅ Complete — 0 `.js` in `src/`, `allowJs` off (tickets 6–7) |
| `packages/shared` — `@mycoaster/shared` | ✅ Created (ticket 4), consumed by both apps (ticket 8) |
| Expo app scaffold (`/apps/app`) | ✅ Complete — Expo SDK 57, expo-router, TypeScript |
| App screens (layout) | ✅ Complete — all Phase 1 screens plus ranks/photos/AI summary from later phases |
| App data layer (HTTP client, auth, API wiring) | ❌ Not started — every screen reads from `src/constants/mock-data.ts` |
| App Firebase Auth + JWT storage | ❌ Not started |
| Monorepo migration (pnpm workspace, TS API, shared package) | 🟡 Api side proven (dev + build); app side (Metro/iOS/Android) awaiting confirmation — see `.specs/project/ROADMAP.md` |
| n8n workflow (spec) | ✅ Spec complete, importable JSON exists |
| Object storage integration | ❌ Not yet decided (S3 vs R2) |
| AI batch job | ❌ Phase 4 — not yet built |
