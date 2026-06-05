# CONCERNS.md — MyCoaster

## 🔴 High Priority Concerns

### C-001: Redis cache not invalidated by credit trigger
**Area:** `api/src/` (credits route — not yet built)
**Risk:** The PostgreSQL trigger updates `credit_count` synchronously, but the Redis leaderboard cache has no invalidation logic yet. When a user earns a credit, the leaderboard will be stale until TTL expires or a manual flush.
**Recommendation:** In `POST /credits` and `DELETE /credits/:coaster_id` handlers, after DB write, explicitly call `redis.del('leaderboard')` or update the sorted set directly.

### C-002: Firebase token validation not implemented in auth middleware
**Area:** `api/src/middlewares/auth.js`
**Risk:** The current `auth.js` validates a **self-issued JWT** (`jwt.verify(token, JWT_SECRET)`), NOT a Firebase token. But the spec says `POST /auth/login` exchanges a Firebase token for a server JWT — this exchange endpoint doesn't exist yet. If a Firebase token is sent directly to a protected route, it will fail validation silently.
**Recommendation:** Build `POST /auth/login` that calls `firebase-admin.auth().verifyIdToken()` before issuing the internal JWT. The `firebase-admin` package is installed but no Firebase initialization code exists yet.

### C-003: No input validation / request sanitization
**Area:** All future routes
**Risk:** No `joi`, `zod`, or `express-validator` installed. Without schema validation, invalid payloads (e.g., rating=99, non-UUID IDs, missing required fields) will either produce cryptic DB errors or be silently ignored.
**Recommendation:** Add a validation library before building routes. `zod` is a natural fit for JS projects.

### C-004: Photo upload rate limiting not enforced at DB level
**Area:** Future `POST /photos` route
**Risk:** The spec requires max 3 photos/user/park/period (6 for premium). This is a business rule that cannot be expressed as a simple DB constraint — it requires a COUNT query per user+target+period. Without explicit enforcement, users can upload unlimited photos.
**Recommendation:** Enforce in the route handler with a query like `COUNT(*) FROM photos WHERE user_id=? AND park_id=? AND created_at > period_start`.

## 🟡 Medium Priority Concerns

### C-005: Geo proximity query strategy not implemented
**Area:** Future `/parks?lat=&lng=&radius=` and `/coasters?lat=&lng=&radius=` routes
**Risk:** `idx_parks_lat_lng` is a simple btree index on float columns. A naive `BETWEEN lat±delta AND lng±delta` box query will work but is imprecise (returns a bounding box, not a true circle). No `earth_distance` or PostGIS extension is set up.
**Recommendation:** Either add the `earthdistance` + `cube` PostgreSQL extensions (lightweight, built-in) or use a Haversine formula in SQL. Avoid relying solely on bounding-box filtering for radius queries.

### ~~C-006: `reviews` table has nullable coaster_id and park_id with no DB-level integrity check~~ ✅ RESOLVED 2026-06-05
Added `chk_reviews_mutual_exclusivity` in `api/migrations/20260605000001_add_reviews_mutual_exclusivity.js`.

### ~~C-007: No `updated_at` auto-update mechanism for reviews~~ ✅ RESOLVED 2026-06-05
Added `trg_reviews_updated_at` trigger in `api/migrations/20260605000002_add_reviews_updated_at_trigger.js`.

### C-008: n8n workflow JSON not fully validated
**Area:** `scraper/rcdb-workflow.json`
**Risk:** The workflow has been partially tested and the `coasterStatusMap` regex bug was found and fixed (initial regex matched markdown `####` instead of raw HTML `<h4>`). However, additional issues are still being identified and fixed — the workflow is not yet considered production-ready.
**Recommendation:** Continue iterating on known issues before marking as complete.

## 🟢 Low Priority / Notes

### C-009: Object storage not decided
**Area:** `POST /photos` route (future)
**Impact:** Can't build the photo upload route until S3 vs R2 decision is made and SDK is integrated. The `image_url` is already in the schema; only the upload mechanism is missing.

### C-010: No CORS policy configured beyond wildcard
**Area:** `api/src/index.js`
**Current:** `app.use(cors())` — allows all origins
**Risk:** Fine for development, but in production should be restricted to the app's domain / production URL. Low risk since the API is consumed by a mobile app (not a browser), but worth tightening before launch.

### C-011: `knex.schema.raw()` vs `knex.raw()` inconsistency
**Area:** Migrations
**Detail:** Some migrations use `knex.schema.raw()` (which returns a schema builder chain) and others use `knex.raw()` (which returns a query builder). Both work for raw SQL but are semantically different. Standardize on `knex.raw()` for raw SQL in `exports.up`.
