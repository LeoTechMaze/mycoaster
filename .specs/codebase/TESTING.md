# TESTING.md — MyCoaster

## Current State
**No test suite exists yet.** No test framework is installed (no `jest`, `mocha`, `supertest`, or similar in `package.json`).

## Recommended Testing Strategy (to establish when building routes)

### Unit Tests
- **Target:** Pure business logic functions (badge threshold calculation, proximity math, AI summary triggers)
- **Framework:** Jest
- **Pattern:** Input → expected output, no DB or network

### Integration Tests
- **Target:** API routes (request → response through the full middleware stack)
- **Framework:** Jest + Supertest
- **Pattern:** Spin up test DB (Docker Compose), run migrations, seed fixtures, fire HTTP requests, assert response + DB state
- **Key scenarios to cover:**
  - `POST /auth/login` with valid/invalid Firebase tokens
  - `POST /credits` — idempotency (duplicate credit returns 409)
  - Credit trigger: `credit_count` and `badge_level` update correctly on insert/delete
  - Review unique constraint: second review for same user+coaster returns 409
  - Geo queries: parks within radius return correct results

### Migration Tests
- Run `knex migrate:latest` against fresh DB and verify all tables + constraints exist
- Verify rollback (`knex migrate:rollback`) works cleanly

## Gate Check Commands (once tests are added)
```bash
npm test                  # unit + integration
npm run test:integration  # integration only (requires DB)
```

## Notes
- The credit trigger logic (`GREATEST(credit_count - 1, 0)`) should be tested via integration test — it's a PL/pgSQL trigger, not unit-testable in JS
- Photo upload limit per user/period needs enforcement at the route level (not DB-level) — will require a test
