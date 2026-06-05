# MyCoaster — Build Metrics

> Tracking velocity, output, and AI-assisted development efficiency across phases.
> Token costs tracked from Phase 1 onward via `/cost` at end of each session.

---

## Phase 0 — Foundation

**Goal:** Production-ready backend infrastructure, DB schema, scraper, staging environment.
**Period:** 2026-05-15 → 2026-06-05
**Active coding sessions:** 3 days (2026-05-22, 2026-05-23, 2026-06-05)

### What shipped

| Area     | Deliverable                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Database | 12 Knex migrations — 8 tables (users, parks, coasters, credits, reviews, photos, photo_likes, videos) |
| Database | PL/pgSQL trigger for denormalized `credit_count` + `badge_level` auto-update                          |
| API      | Express server with helmet, CORS, Morgan, express-async-errors                                        |
| API      | Env validation at startup (Zod — `process.exit(1)` on missing required vars)                          |
| API      | Firebase Admin SDK initialization                                                                     |
| API      | JWT auth middleware (`req.user = { id, email }`)                                                      |
| API      | Zod validation middleware factory (`validate(schema, source)`)                                        |
| API      | Standardized response envelope (`success(res, data, { status, meta })`)                               |
| API      | Global error handler with PG error code mapping                                                       |
| API      | Route scaffold with Phase 1 stubs                                                                     |
| API      | Health check endpoint (`/health` — DB + Redis ping)                                                   |
| Infra    | Docker Compose (PostgreSQL 16 + Redis 7) for local development                                        |
| Infra    | CI/CD pipeline via EasyPanel — auto-deploy on push to `develop`                                       |
| Infra    | Staging environment live (PostgreSQL + Redis as managed services)                                     |
| Data     | Dev seed — 2 parks, 26 coasters with real RCDB IDs                                                    |
| Scraper  | n8n workflow (887-line JSON) — daily RCDB scraper, upserts parks + coasters                           |
| Tooling  | AI agent contracts (`.claude/AGENTS.md`, 3 skill files)                                               |
| Docs     | 16 spec files across codebase/, project/, docs/ directories                                           |

### Git metrics

| Metric                                            | Value                                            |
| ------------------------------------------------- | ------------------------------------------------ |
| Commits                                           | 20                                               |
| New files created                                 | 32                                               |
| Total lines written                               | 3,401                                            |
| Total lines changed                               | 3,401 insertions / 928 deletions across 42 files |
| Production source code (API + migrations + infra) | 375 lines net                                    |
| Spec & documentation                              | ~1,800 lines                                     |

### Estimated equivalent manual effort

| Task                                                                            | Estimated manual time |
| ------------------------------------------------------------------------------- | --------------------- |
| Express API base setup (env validation, auth, error handling, middleware stack) | 1 day                 |
| PostgreSQL schema design + 12 migrations                                        | 1 day                 |
| PL/pgSQL trigger + badge logic                                                  | 0.5 day               |
| n8n RCDB scraper workflow                                                       | 1.5 days              |
| Docker Compose + EasyPanel CI/CD setup                                          | 0.5 day               |
| Spec documentation (16 files)                                                   | 1 day                 |
| **Total estimated**                                                             | **~5.5 days**         |
| **Actual active sessions**                                                      | **3 days**            |

### AI token cost

> Not tracked for Phase 0 (tracking starts Phase 1 via `/cost` per session).
> Estimated range: $8–$15 based on session length and context.

---

## Phase 1 — MVP Launch _(in progress)_

**Goal:** 12 REST API endpoints — auth, users, parks, coasters, credits, reviews.

| Session | Date | Focus | Tokens | Cost |
| ------- | ---- | ----- | ------ | ---- |
| —       | —    | —     | —      | —    |

---

## Cumulative Summary

| Phase               | Sessions | Commits | Files | Lines | Est. Cost |
| ------------------- | -------- | ------- | ----- | ----- | --------- |
| 0 — Foundation      | 3        | 20      | 32    | 3,401 | ~$10–15   |
| 1 — MVP Launch      | —        | —       | —     | —     | —         |
| 2 — Competition     | —        | —       | —     | —     | —         |
| 3 — Community       | —        | —       | —     | —     | —         |
| 4 — AI Intelligence | —        | —       | —     | —     | —         |
| 5 — Monetization    | —        | —       | —     | —     | —         |

---

## Methodology

- **Commits** and **lines**: `git log` / `git diff --stat` from phase start to phase end commit
- **Token cost**: `/cost` command in Claude Code at end of each session, summed per phase
- **Equivalent manual effort**: conservative estimate based on typical senior dev velocity
- **Active sessions**: days with ≥1 commit, not calendar days from start to end
