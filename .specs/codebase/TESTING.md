# TESTING.md — MyCoaster

> Scope: API (`/apps/api`). The React Native app doesn't have a testing strategy
> defined yet — it will be added when the UI phase starts.

## Current State

Old documentation said "no tests exist." **That's outdated.**
What exists today:

- **Framework:** Jest 30 + Supertest 7 (`apps/api/package.json`, `devDependencies`).
- **Integration layer: mature.** 6 route suites in `apps/api/tests/routes/`
  (`auth`, `users`, `parks`, `coasters`, `credits`, `reviews`).
- **Test DB lifecycle:** `apps/api/tests/globalSetup.js` creates the database if
  it doesn't exist, runs `migrate.latest()`, `TRUNCATE ... CASCADE` and `seed.run()`
  once before the whole run. `apps/api/tests/teardown.js`
  (`setupFilesAfterEnv`) closes Redis/Firebase handles per suite; each suite
  closes its own Knex pool in `afterAll`.
- **Serial execution:** `maxWorkers: 1` / `jest --runInBand` — the suites
  share a real DB and would race each other in parallel.
- **Smoke endpoint:** `GET /health` (`apps/api/src/app.js`) already exists and checks
  Postgres + Redis (200 `ok` / 503 `degraded`).
- **Helpers:** `tests/helpers/db.js` (`db`, `truncate`),
  `tests/helpers/auth.js` (`generateToken` — signs an internal JWT).

What's **missing**, and what this doc plans for: the **Unit** layer, the
**no-DB** execution path, **post-deploy smoke**, and the (deferred) definition
of **E2E**.

---

## The 4 Layers (mapped to this project)

| Layer | What it tests | Where it runs | Touches the DB? | When | Status here |
| --- | --- | --- | --- | --- | --- |
| **Unit** | Isolated function (Zod validation, cursor encode/decode) | In memory, no network | No | Every commit | ❌ Doesn't exist — **main piece of work** |
| **Integration** | Routes + DB + logic together | Disposable test DB | Yes, and may destroy data | Every commit/PR | ✅ Mature — document, don't redesign |
| **Smoke / Health** | "Did the build come up and respond?" | Real staging/prod | Reads, never writes | Right after deploy | 🟡 Endpoint exists; post-deploy check is missing |
| **E2E / Synthetic** | Full user flow in a live environment | Staging | Yes, isolated test data | Post-deploy / monitor | ⏸️ **Deferred** — no staging target yet |

> ⚠️ **Watch out for the generic table:** "badge calculation" is usually the
> textbook example of a *unit* test. **Not here** — `credit_count` and `badge_level` are
> maintained by a PL/pgSQL trigger
> (`apps/api/migrations/20260515000009_create_credit_trigger.js`), not by JS
> code. So badges are covered **only at the integration layer**. Don't look
> for JS badge code to "unit test."

---

## Unit (net-new — focus of the implementation)

### The decision that makes this implementable: a no-DB execution path

`globalSetup.js` creates/migrates/seeds Postgres **unconditionally**. Unit
tests can't depend on that. Solution: split the two runs with Jest
`projects`, keeping the current integration path **intact**.

`apps/api/jest.config.js` becomes:

```js
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['**/tests/unit/**/*.test.js'],
      // NO globalSetup, NO DB teardown — runs in memory, fast
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['**/tests/routes/**/*.test.js'],
      setupFiles: ['./tests/env.js'],
      setupFilesAfterEnv: ['./tests/teardown.js'],
      globalSetup: './tests/globalSetup.js',
      testTimeout: 30000,
      maxWorkers: 1,
    },
  ],
};
```

Scripts in `apps/api/package.json`:

```json
"test":             "jest --runInBand",
"test:unit":        "jest --selectProjects unit",
"test:integration": "jest --selectProjects integration --runInBand"
```

`test:unit` doesn't need Postgres/Redis — runs anywhere, fast, on
every commit. `test` keeps running both via `--runInBand` (the integration
project's `maxWorkers: 1` guarantees serialization).

### The real unit surface (it's thin — the API is validation + SQL)

| Target | File | What to test |
| --- | --- | --- |
| `UUID_RE` / `uuid` | `src/utils/schemas.js` | accepts structured seed UUIDs; rejects `not-a-uuid`, empty string, malformed UUID (see [[feedback_zod_v4_uuid]]) |
| `isGeoSearch` | `src/utils/search.js` | `true` only with lat+lng+radius; `false` if any is missing |
| `listQuerySchema` | `src/utils/search.js` | `.refine` approves full geo OR country/city; rejects mixed/empty request |
| `success` | `src/utils/response.js` | `{ data }` envelope; includes `meta` only when passed; applies `status` |
| `encodeCursor` / `decodeCursor` | **extract from** `src/routes/reviews.js` → `src/utils/pagination.js` | round-trip encode→decode; rejects (422) a cursor with invalid date or non-UUID id |

> **Prerequisite for the best unit target:** `encodeCursor`/`decodeCursor` are
> currently private functions inside `reviews.js`, covered only via the route (integration).
> Extracting them to `src/utils/pagination.js` and exporting them makes them
> unit-testable and reusable by future paginated endpoints.

> **Don't unit test:** `haversine` and `avgRatingSql` (`search.js`) return **SQL
> strings** — they only make sense executed against the database; they belong
> in integration.

---

## Integration (existing — keep the pattern)

Already covers the key scenarios: auth (valid/missing token → 401), review
uniqueness (409), coaster/park mutual exclusivity (422), rating range (422),
not-found (404), ownership (403), cursor pagination, and the credit trigger.

Pattern for **adding a suite** (model: `tests/routes/reviews.test.js`):

1. `const app = require('../../src/app')` + `supertest`.
2. Fixtures come from the seed (`seeds/01_parks_and_coasters.js`); structured
   IDs (`10000000-...`, `20000000-...`, `30000000-...`). Insert extra users with
   `.onConflict('id').ignore()`.
3. `beforeEach`: clear the tables the suite writes to (`db('reviews').del()`);
   generate a token with `generateToken({ id, email })`.
4. `afterAll`: clean up what it inserted and `await db.destroy()`.
5. Assertions on the envelope: success → `res.body.data`; error → `res.body.error`.

**Gaps to close as new routes arrive:** per-user/per-period photo upload limit
(route-level rule, C-004), geo query precision
(haversine vs. bounding-box, C-005), and the Firebase→JWT exchange in
`POST /auth/login` (C-002).

---

## Smoke / Health (endpoint ready — post-deploy check is missing)

`GET /health` already validates Postgres + Redis. What's missing is automating
the trigger **after deploy**, against the real URL, **read-only**.

Implement `apps/api/scripts/smoke.js` (or a CI step) that:

1. `GET ${BASE_URL}/health` → expects 200 and `{ status: 'ok' }`.
2. (Optional) 1–2 public read-only GETs (e.g. `GET /api/v1/reviews/coaster/:id`
   for a known seed id) → expects 200.
3. Exits with a non-zero code if anything fails, to block deploy promotion.

Never writes. Runs against staging/prod right after deploy.

---

## E2E / Synthetic (defined, deferred)

**Deferred until a staging target with a deploy pipeline exists** — there's no
evidence of one today, and it's not worth specifying infra without a home for it.

Once staging exists, define a synthetic flow against the live environment:
login (Firebase→JWT) → create credit → create review → read it back → clean up.
Requirements: dedicated synthetic user + isolated data + cleanup at the end
(never touch real user data). Runs post-deploy / in a continuous monitor.

---

## Gate Commands

```bash
# from /apps/api root
npm run test:unit          # no DB — fast, every commit
npm run test:integration   # requires test Postgres + Redis
npm test                   # unit + integration (serial)
node scripts/smoke.js      # post-deploy, against BASE_URL (read-only)
```

**Suggested CI:** `test:unit` on every push (no services); `test:integration`
on PR with Postgres+Redis as services; `smoke` as a post-deploy step.

---

## Notes

- The credit trigger logic (`GREATEST(credit_count - 1, 0)`) is PL/pgSQL —
  tested **only at the integration layer** (insert/delete and the effect on
  `credit_count`/`badge_level`), never in unit.
- `tests/teardown.js` exists because `globalTeardown` runs in a separate module
  registry and doesn't close the Redis/Firebase singletons that the suites
  actually opened — don't remove it without understanding the "open handle" it fixes.
- Migration tests (running `migrate:latest` on a clean DB + `migrate:rollback`)
  are implicitly exercised by `globalSetup`; an explicit rollback test can be
  added if migrations get riskier.
