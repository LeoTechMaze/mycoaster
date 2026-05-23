# STATE.md — MyCoaster

_Persistent memory: decisions, blockers, lessons, deferred ideas. Updated each session._

---

## Current Status
**Date:** 2026-05-22
**Active Phase:** Phase 0 (Foundation) + Phase 1 (MVP) starting
**Codebase maturity:** Backend skeleton complete. No routes yet. No app yet. Status field added to both `parks` and `coasters` (migrations run). DB populated with parks and coasters from RCDB (Brazil scope, all statuses correct).

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
- **B-002:** Firebase Admin SDK not initialized in codebase — blocks `POST /auth/login`
- ~~**B-003:** n8n scraper not yet run against real RCDB~~ ✅ RESOLVED 2026-05-22 — scraper run against Brazil scope, parks and coasters populated with correct status values.

---

## Technical Concerns (see CONCERNS.md for detail)

- **C-001** 🔴 Redis cache not invalidated by credit trigger — needs wiring in credits route
- **C-002** 🔴 Firebase Admin SDK not initialized — `auth.js` handles own JWT but not Firebase token exchange
- **C-003** 🔴 No input validation library installed
- **C-004** 🔴 Photo upload rate limiting not enforced at DB level — needs route-level enforcement
- **C-005** 🟡 Geo proximity: btree index on floats is approximate bounding box only
- **C-006** 🟡 `reviews` table missing check constraint for coaster_id/park_id mutual exclusivity
- **C-007** 🟡 `reviews.updated_at` not auto-updated on UPDATE — needs trigger or route discipline
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

1. Initialize Firebase Admin SDK in `api/src/config/firebase.js`
2. Add `reviews` mutual-exclusivity check constraint (follow-up migration)
3. Add `reviews.updated_at` auto-update trigger (follow-up migration)
4. Install input validation library (recommend `zod`)
5. Build `POST /auth/login` route
6. Build all Phase 1 API routes
7. ~~Run n8n scraper against Brazil scope~~ ✅ Done
8. Start React Native app scaffold
