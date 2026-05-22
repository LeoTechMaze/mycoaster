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

### C-006: `reviews` table has nullable coaster_id and park_id with no DB-level integrity check
**Area:** `api/migrations/20260515000005_create_reviews.js`
**Risk:** Both `coaster_id` and `park_id` are nullable, and `target_type` determines which is populated. Nothing at the DB level prevents a row with `target_type='coaster'` but no `coaster_id`, or a row with both set.
**Recommendation:** Add a check constraint: `CHECK ((target_type = 'coaster' AND coaster_id IS NOT NULL AND park_id IS NULL) OR (target_type = 'park' AND park_id IS NOT NULL AND coaster_id IS NULL))`. This is a missing migration that should be added.

### C-007: No `updated_at` auto-update mechanism for reviews
**Area:** `api/migrations/20260515000005_create_reviews.js`
**Risk:** `reviews.updated_at` defaults to `now()` at insert time but won't auto-update on `PUT /reviews/:id` unless the route explicitly sets it. Easy to forget.
**Recommendation:** Add a PL/pgSQL trigger to auto-set `updated_at = NOW()` on UPDATE, similar to the credit trigger pattern already established.

### C-008: n8n workflow JSON not yet validated / tested
**Area:** `scraper/rcdb-workflow.json`
**Risk:** The workflow spec is thorough, but the JSON in `/scraper/rcdb-workflow.json` hasn't been imported and tested against the live RCDB site. RCDB HTML structure could differ from what the spec assumes (CSS selectors, title format).
**Recommendation:** Import the workflow into the n8n instance and run a test against Brazil scope (9 pages, ~50 parks) before running the global load.

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
