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
- [x] Configurar repositório monorepo (/api, /app, /scraper)
- [ ] Configurar Docker Compose (PostgreSQL + Redis)
- [ ] Configurar projeto Node.js + Express base (/api)
- [ ] Setup CI/CD e ambiente de staging
- [ ] Firebase Admin SDK initialized in API

### Developer Tooling (parallel — before Phase 1 routes)

- [x] Create `.claude/AGENTS.md` (Planner, Generator, Evaluator contracts + Git discipline)
- [x] Create skills: `/planner`, `/generator`, `/evaluator` (`.claude/skills/`)
- [x] Configure harness hooks: linter, type checker, tests/E2E, review agent, git guard
- [x] Create `.claude/init.sh` bootstrap script
- [x] Create `.claude/progress.md` session state template

## Phase 1 — MVP Launch (P0, requires Phase 0)

**Goal:** Functional app that delivers value and starts accumulating reviews.

- [ ] `POST /auth/login` — Firebase token exchange → internal JWT
- [ ] `GET /users/:id` — public profile
- [ ] `PATCH /users/me` — update profile
- [ ] `GET /parks?lat=&lng=&radius=` — nearby parks by GPS
- [ ] `GET /parks?country=&city=` — search by city/country
- [ ] `GET /parks/:id` — park detail (data + avg rating)
- [ ] `GET /parks/:id/coasters` — coasters in a park
- [ ] `GET /coasters/:id` — coaster detail
- [ ] `POST /credits` + `DELETE /credits/:coaster_id` — mark/unmark ridden
- [ ] `GET /credits/me` — credit history
- [ ] `POST /reviews` + `PUT /reviews/:id` — create/update review
- [ ] `GET /reviews/park/:id` + `GET /reviews/coaster/:id`
- [ ] React Native app: auth, discovery, credit marking, profile, reviews

## Phase 2 — Competition & Retention (P1, requires Phase 1)

**Goal:** Turn individual tool into social/competitive experience.

- [ ] `GET /leaderboard` — top users by credit_count (Redis cached)
- [ ] Badge visuals in UI (Novato, Entusiasta, Veterano, Lenda)
- [ ] Native share sheet (share achievements)
- [ ] Public profile with social media links (Instagram, TikTok, YouTube)

## Phase 3 — Community Content (P2, requires Phases 1+2)

**Goal:** Rich visual content on park and coaster pages.

- [ ] `POST /photos` — upload with period limit enforcement (3/user/target for standard, 6 for premium)
- [ ] `POST /photos/:id/like` + `DELETE /photos/:id/like`
- [ ] `DELETE /photos/:id`
- [ ] Photo gallery endpoints (`GET /parks/:id/photos`, `GET /coasters/:id/photos`)
- [ ] `POST /videos` + `DELETE /videos/:id` (YouTube URL, oEmbed thumbnail extraction)
- [ ] Video gallery endpoints (`GET /parks/:id/videos`, `GET /coasters/:id/videos`)
- [ ] Moderation pipeline (delay + community report)
- [ ] Cold start: seed content + launch campaign

## Phase 4 — AI Intelligence (P2, requires Phase 3 + ≥10 reviews/target)

**Goal:** Add value on top of accumulated review mass.

- [ ] AI batch job (cron) — LLM API call per park/coaster with ≥10 reviews
- [ ] `ai_summary` JSONB populated in parks + coasters tables
- [ ] App: display summary + clickable thematic tags
- [ ] Tag click → filter reviews by theme

## Phase 5 — Monetization (P3, requires validated retention)

**Goal:** Generate revenue after proven engagement.

- [ ] Premium subscription (higher upload limits, advanced stats, custom profile)
- [ ] Geolocated coupons (requires park partnerships)
- [ ] Hotel affiliate links near parks (Booking, Hoteis.com)
