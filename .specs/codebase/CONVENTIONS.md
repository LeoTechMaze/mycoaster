# CONVENTIONS.md — MyCoaster

## Language & Module System
- **JavaScript** only (no TypeScript) — CommonJS (`require` / `module.exports`)
- Node.js ≥ 20 required

## File & Directory Naming
- Lowercase kebab-case for files: `error-handler.js`, `knexfile.js`
- Directories lowercase: `src/`, `config/`, `middlewares/`, `migrations/`

## Code Style
- No linting config found yet (no `.eslintrc`) — but `eslint-disable no-unused-vars` comment seen in errorHandler.js, suggesting ESLint is intended
- 2-space indentation (observed in all source files)
- Single quotes for strings
- Semicolons used

## Error Handling
- `express-async-errors` is installed — async route handlers don't need try/catch; errors propagate to `errorHandler` automatically
- Operational errors: attach `.status` or `.statusCode` to the error object
- Known PG error codes handled in `errorHandler`: `23505` (unique violation → 409), `23503` (FK violation → 400)
- Dev vs prod: stack traces only in `NODE_ENV=development`

## Database Conventions
- **UUIDs** as primary keys: `gen_random_uuid()` via PostgreSQL
- **Timestamps**: always timezone-aware (`{ useTz: true }`)
- **Soft deletes**: not used — hard deletes with cascade
- **Denormalized counters**: `users.credit_count` and `photos.like_count` are maintained via triggers/app logic for O(1) reads
- **Partial indexes** for conditional unique constraints (e.g., reviews unique per user+coaster WHERE target_type='coaster')
- **Check constraints** enforced at DB level: `rating BETWEEN 1 AND 5`, `target_type IN ('coaster','park')`, `status IN ('pending','approved','rejected')`
- Migration filenames: `YYYYMMDDHHMMSS_description.js`

## Knex Patterns
- Schema builder for DDL (table creation, indexes)
- `knex.raw()` for SQL that schema builder can't express (partial indexes, check constraints, triggers)
- `knex.schema.raw()` used for CREATE INDEX statements (note: both `knex.raw()` and `knex.schema.raw()` seen — prefer `knex.raw()` for consistency)

## Auth Middleware
- Function signature: `authenticate(req, res, next)`
- Attaches `req.user = { id, email }` on success
- Usage: pass as middleware to protected routes

## Environment Variables
- Loaded via `dotenv` from project root `.env`
- knexfile.js has special env-finding logic to handle `knex` being run from different CWDs
- Required vars: `DATABASE_URL` or `POSTGRES_*` fields, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `JWT_SECRET`, `PORT`

## Badges (i18n)
- Stored in DB in English: `rookie`, `enthusiast`, `veteran`, `legend`
- Translated in the app via i18n (not in the API response)

## API Responses
- JSON only (`express.json()`)
- Error shape: `{ error: "message" }` (+ `stack`, `message` in dev)
- Success shape: not yet standardized (routes not built) — establish a consistent envelope when building routes
