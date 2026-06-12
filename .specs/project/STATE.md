# STATE.md — MyCoaster

_Persistent memory: decisions, blockers, lessons, deferred ideas. Updated each session._

---

## Current Status
**Date:** 2026-06-05
**Active Phase:** Phase 0 complete → Phase 1 (MVP) starting
**Codebase maturity:** Backend base fully configured. Route scaffold in place (no route logic yet). Staging environment live on EasyPanel. DB seeded with Canada's Wonderland + Hopi Hari for local development. RCDB scraper populated Brazil scope in production.

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth | Firebase Auth + own JWT | OAuth ready (Google/Apple) without server-side OAuth implementation |
| DB | PostgreSQL + knex | Primary store; UUID PKs; knex for migrations + query building |
| Cache | Redis (ioredis) | Leaderboard read frequency; O(1) reads |
| credit_count | Denormalized via PG trigger | O(1) profile + leaderboard reads |
| Badge storage | English strings in DB | i18n-ready; app translates |
| Reviews | Equal weight for all users | Credibility; badges give context without distorting average |
| Videos | YouTube URLs only | Zero storage cost; oEmbed for thumbnail/title |
| AI summaries | JSONB batch cache, ≥10 reviews threshold | No real-time LLM costs |
| Geo queries | lat/lng floats + btree index | No Google Maps API dependency |
| React Native | No Expo | Full native module control |
| Scraper | n8n self-hosted | Built-in scheduling, retries, logs |
| Coaster/park status | 4 values: `operating`, `sbno`, `under_construction`, `defunct` | `sbno` (Standing But Not Operating) is distinct from `defunct` — SBNO means temporarily closed, may return; defunct means permanently closed. Sourced from RCDB g.htm?id= (parks) and section headings (coasters). |
| Object storage | TBD (S3 or R2) | Not yet decided |

---

## Active Blockers

- **B-001:** Object storage decision (S3 vs R2) — blocks photo upload route (Phase 3)
- ~~**B-002:** Firebase Admin SDK not initialized~~ ✅ RESOLVED 2026-06-05 — `api/src/config/firebase.js` created; initializes on startup when `FIREBASE_SERVICE_ACCOUNT_PATH` is set.
- ~~**B-003:** n8n scraper not yet run against real RCDB~~ ✅ RESOLVED 2026-05-22 — scraper run against Brazil scope, parks and coasters populated with correct status values.

---

## Technical Concerns (see CONCERNS.md for detail)

- ~~**C-001**~~ ✅ Redis cache invalidated in credits route — `redis.del('leaderboard').catch(() => {})` wired in POST and DELETE handlers
- ~~**C-002**~~ ✅ Firebase Admin SDK initialized in `api/src/config/firebase.js`
- ~~**C-003**~~ ✅ Zod installed and `validate` middleware created (`api/src/middlewares/validate.js`)
- **C-004** 🔴 Photo upload rate limiting not enforced at DB level — needs route-level enforcement
- **C-005** 🟡 Geo proximity: btree index on floats is approximate bounding box only
- ~~**C-006**~~ ✅ Reviews mutual-exclusivity constraint added (`20260605000001_add_reviews_mutual_exclusivity.js`)
- ~~**C-007**~~ ✅ `reviews.updated_at` trigger added (`20260605000002_add_reviews_updated_at_trigger.js`)
- **C-008** 🟡 n8n workflow JSON not tested against live RCDB yet (status extraction from section headings is new — needs a real run to validate regex against live HTML)
- **C-011** 🟢 `knex.schema.raw()` vs `knex.raw()` inconsistency in migrations

---

## Deferred Ideas

- Filtering coasters by type, height, speed — explicitly out of scope for all phases
- Friend activity feed / timeline — out of scope
- Push notifications — out of scope for now
- Offline mode — out of scope
- Weighted reviews for premium users — explicitly rejected (credibility concern)
- PostGIS for geo queries — could replace the btree lat/lng approach if precision becomes a problem
- Individual coaster lat/lng (currently uses parent park lat/lng for proximity)

---

## Lessons Learned

- The `reviews` table partial unique indexes are clean but the missing mutual-exclusivity check constraint (C-006) is a gap — add in a follow-up migration before Phase 1 routes are built
- The credit trigger pattern (PL/pgSQL) is well-established here — follow the same pattern for `reviews.updated_at` auto-update

---

## Next Actions (Priority Order)

Phase 1 is split into 5 focused PRs:
1. ~~`feat/phase-1-migrations`~~ ✅ C-006 + C-007 resolved
2. ~~`feat/phase-1-auth-users`~~ ✅ POST /auth/login, GET /users/:id, PATCH /users/me + Jest/Supertest harness
3. ~~`feat/phase-1-parks-coasters`~~ ✅ read-only catalog + geo routes
4. ~~`feat/phase-1-credits`~~ ✅ credits CRUD + Redis cache invalidation (C-001)
5. `feat/phase-1-reviews` — reviews CRUD
6. React Native app — separate effort, after API is stable
