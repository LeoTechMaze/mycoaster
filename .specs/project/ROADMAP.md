# ROADMAP.md — MyCoaster

## Phase 0 — Foundation (P0, runs in parallel)

**Goal:** Infrastructure ready, data populated before any app screen is tested.

- [x] PostgreSQL schema — all 12 migrations created (includes status on parks + coasters)
- [x] Credit trigger (PL/pgSQL)
- [x] Express server bootstrap (health check, middleware stack)
- [x] Auth middleware (JWT)
- [x] Error handler middleware
- [x] Knex + Redis config
- [x] n8n scraper running and populating parks + coasters from RCDB
- [x] Configure monorepo (/api, /app, /scraper)
- [x] Configure Docker Compose (PostgreSQL + Redis)
- [x] Configure Node.js + Express base project (/api)
- [x] Setup CI/CD and staging environment
- [x] Firebase Admin SDK initialized in API

### Developer Tooling (parallel — before Phase 1 routes)

- [x] Create `.claude/AGENTS.md` (Planner, Generator, Evaluator contracts + Git discipline)
- [x] Create skills: `/planner`, `/generator`, `/evaluator` (`.claude/skills/`)
- [x] Configure harness hooks: linter, type checker, tests/E2E, review agent, git guard
- [x] Create `.claude/init.sh` bootstrap script
- [x] Create `.claude/progress.md` session state template

## Phase 1 — MVP Launch (P0, requires Phase 0)

**Goal:** Functional app that delivers value and starts accumulating reviews.

- [x] `POST /auth/login` — Firebase token exchange → internal JWT
- [x] `GET /users/:id` — public profile
- [x] `PATCH /users/me` — update profile
- [x] `GET /parks?lat=&lng=&radius=` — nearby parks by GPS
- [x] `GET /parks?country=&city=` — search by city/country
- [x] `GET /parks/:id` — park detail (data + avg rating)
- [x] `GET /parks/:id/coasters` — coasters in a park
- [x] `GET /coasters/:id` — coaster detail
- [x] `POST /credits` + `DELETE /credits/:coaster_id` — mark/unmark ridden
- [x] `GET /credits/me` — credit history
- [x] `POST /reviews` + `PUT /reviews/:id` — create/update review
- [x] `GET /reviews/park/:id` + `GET /reviews/coaster/:id`

### App (Expo — all Phase 1 backend endpoints are done)

Layout pass shipped 2026-08-13: every screen below already exists in `app/src/app/`, rendering
static content from `src/constants/mock-data.ts`. The remaining work is wiring, not building.

- [x] Expo project scaffold — SDK 57, expo-router, TypeScript, Space Grotesk, theme tokens
- [x] Screen layouts — onboarding, login, home, explore, park detail, coaster detail, profile, review composer, log-ride sheet
- [ ] Setup: env config, HTTP client with JWT interceptor, API types, per-resource services
- [ ] Firebase Auth (Google, Apple, email) + JWT in expo-secure-store + login screen wiring
- [ ] Onboarding gate: tutorial on first launch only
- [ ] Home: real user stats and nearby parks
- [ ] Explore: GPS discovery (expo-location) + city/country search + working filter chips
- [ ] Park detail: park data, coaster list with ridden indicator, progress card
- [ ] Coaster detail: real data + conditional ride/review CTAs
- [ ] Credits: mark/unmark with optimistic update and rollback
- [ ] Profile: user data, badge progress, credit history, PATCH /users/me
- [ ] Reviews: interactive composer (create + edit) and review lists on park & coaster
- [ ] Loading / empty / error states and accessibility pass
- [ ] Hide Phase 2/3/4 elements behind feature flags (see below)

**Built but deferred** — the layout pass also produced screens belonging to later phases.
They are hidden in Phase 1 and their wiring is tracked under the phase that owns them:
ranks/leaderboard tab and social links (Phase 2), photo gallery tab (Phase 3), AI summary card (Phase 4).

### Monorepo migration (pnpm workspace + TypeScript API)

Decided 2026-08-15. The repo is already a monorepo (Phase 0 above); what is missing is the
workspace layer, a `shared` package, and TypeScript on the API. **Migration, not rewrite** — the
API is ported file by file, with the 6 integration suites as the safety net. Tracked in ClickUp
under Phase 1.

- [ ] Baseline + new repo under the `mycoaster` GitHub org (local clone, history preserved, commit the untracked `app/`)
- [ ] Root pnpm workspace: `pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`, `.npmrc`, `.nvmrc`, extended `.gitignore`
- [ ] Restructure to `apps/api`, `apps/app`, `packages/shared`; `scraper/` stays at root
- [ ] `packages/shared` — `@mycoaster/shared`, source-only (no `dist/`), zod as a pinned peer dependency
- [ ] Replace npm + yarn with pnpm; rewrite `metro.config.js` for RN 0.86 + pnpm (highest-risk step)
- [ ] TypeScript boilerplate for `apps/api` (tsx in dev, esbuild bundle on build, `allowJs` during the transition)
- [ ] Port the 20 API source files to TypeScript, leaf to root, suite green at each step
- [ ] End-to-end proof: the same zod schema consumed by the API (dev *and* build) and by the app (iOS + Android)

Deferred to their own tickets: moving the real schemas into `shared`, the app services layer, Turborepo.

## Phase 2 — Competition & Retention (P1, requires Phase 1)

**Goal:** Turn individual tool into social/competitive experience.

- [ ] `GET /leaderboard` — top users by credit_count (Redis cached)
- [ ] App: leaderboard screen (layout exists in `(tabs)/ranks.tsx`) — unhide tab + wire endpoint
- [ ] Badge visuals in UI (Novato, Entusiasta, Veterano, Lenda)
- [ ] App: unhide global rank on home stats card and profile
- [ ] Native share sheet (share achievements)
- [ ] Public profile with social media links (Instagram, TikTok, YouTube) — new route `user/[id].tsx`

## Phase 3 — Community Content (P2, requires Phases 1+2)

**Goal:** Rich visual content on park and coaster pages.

- [ ] `POST /photos` — upload with period limit enforcement (3/user/target for standard, 6 for premium)
- [ ] `POST /photos/:id/like` + `DELETE /photos/:id/like`
- [ ] `DELETE /photos/:id`
- [ ] Photo gallery endpoints (`GET /parks/:id/photos`, `GET /coasters/:id/photos`)
- [ ] `POST /videos` + `DELETE /videos/:id` (YouTube URL, oEmbed thumbnail extraction)
- [ ] Video gallery endpoints (`GET /parks/:id/videos`, `GET /coasters/:id/videos`)
- [ ] App: photo gallery tab (layout exists in `park/[id].tsx`) — unhide + wire upload, limits, likes
- [ ] App: video section on park and coaster (no layout yet — needs design)
- [ ] Moderation pipeline (delay + community report)
- [ ] Cold start: seed content + launch campaign

## Phase 4 — AI Intelligence (P2, requires Phase 3 + ≥10 reviews/target)

**Goal:** Add value on top of accumulated review mass.

- [ ] AI batch job (cron) — LLM API call per park/coaster with ≥10 reviews
- [ ] `ai_summary` JSONB populated in parks + coasters tables
- [ ] App: display summary + clickable thematic tags (`AiSummaryCard` layout already exists — unhide + wire)
- [ ] Tag click → filter reviews by theme

## Phase 5 — Monetization (P3, requires validated retention)

**Goal:** Generate revenue after proven engagement.

- [ ] Premium subscription (higher upload limits, advanced stats, custom profile)
- [ ] Geolocated coupons (requires park partnerships)
- [ ] Hotel affiliate links near parks (Booking, Hoteis.com)
