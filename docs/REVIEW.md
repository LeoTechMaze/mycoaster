# Review Policy

How code gets into `main` in MyCoaster. Most code is written by AI agents; this policy decides what a human must review and what can merge on its own.

## Two axes

- **Risk** decides who reviews and how the merge happens.
- **Complexity** decides how much design work comes before the code.

They are independent. A task can be complex and low risk, or trivial and high risk (changing one permission check).

## Risk

### How risk is assigned

1. A workflow reads the changed paths and sets a **floor** (table below).
2. The authoring agent adds its own label (`risk:low`, `risk:medium`, `risk:high`).
3. Final risk = the highest of the two. **The agent can raise risk, never lower it.**

### High risk paths

| Area | Paths |
| --- | --- |
| Auth and permissions | `apps/api/src/auth/**`, `apps/api/src/middlewares/auth*`, `apps/api/src/routes/auth.ts`, any role or ownership check |
| Payments | `apps/api/src/payments/**` |
| Secrets and config | `**/.env*`, `apps/api/src/config/**`, `app.config.*`, `apps/app/app.json`, `eas.json` |
| Database | `apps/api/migrations/**`, schema files |
| Infra and CI | `.github/**`, `infra/**`, `Dockerfile*`, `docker-compose*`, `*.tf` |
| Policy | `REVIEW.md`, `CODEOWNERS`, `.github/risk-paths.yml` |

### Medium risk (default for anything not listed)

New business logic, new endpoints, database queries, new dependencies, shared Zod schemas in `packages/shared`.

### Low risk

UI without logic, docs, tests only, refactors fully covered by existing tests.

### What each level requires

| Risk | AI review | Human review | Merge |
| --- | --- | --- | --- |
| Low | Standard | None | Automatic when all checks pass and AI approves |
| Medium | Standard + **review guide** (3 to 4 hotspots to read) | Focused, on the hotspots | Manual by the Engineer |
| High | Deep (security, data integrity, rollback) | Full | Manual by the Engineer |

## Complexity

| Level | Signals | Required before code |
| --- | --- | --- |
| High | External integration (LLM, payments), several modules, architecture choice | Spec + design doc + ADR in `docs/adr/` |
| Medium | New feature inside one module, business rules | Short spec with acceptance criteria |
| Low | CRUD, small fix | None |

The ticket states the complexity level. A PR for a high complexity task links its spec and ADR.

## Quality gates

Every PR must pass these checks.

| Check | API | App |
| --- | --- | --- |
| Lint + typecheck | ESLint with type-aware rules, `tsc` | ESLint (Expo config), `tsc` |
| Unit + integration tests | Vitest with Postgres + Redis services | Jest + React Native Testing Library |
| Coverage on changed code | 80% of changed lines | 60% of changed lines |
| Global coverage floor | 80% lines, branches, functions, statements | 5% (same four metrics) |
| Mutation testing | Stryker on critical modules (auth, ranking) | Stryker on hooks and utils |
| Cyclomatic complexity | Max 15 per function | Max 20 per function |
| Module size | Max 400 lines per file | Max 400 lines per file |
| Dependency audit | `pnpm audit`, Dependabot | same |
| Secret scan | gitleaks | gitleaks |
| E2E | API regression suite | Maestro flows (high risk PRs and nightly) |

Lint notes:

- Complexity and module size are enforced by ESLint (`complexity`, `max-lines`, blank lines and comments excluded). Baseline on 2026-10-09: API max 14 per function and 148 lines per source file; App max 18 and 360 lines.
- Routes in the app (`apps/app/src/app/**`) stay thin: they read data through hooks and compose components. ESLint warns above 150 lines per route file, complexity 8, and on direct imports of `@/lib/api` or `@/constants/mock-data`. At baseline (2026-10-09) there are 12 warnings; they become errors once the existing routes are refactored.
- In the API, untyped data (`any` and the `no-unsafe-*` rules) is reported as warnings, not errors (310 at baseline). The metrics report tracks this count; the target is 0, and then these rules become errors.

Coverage notes:

- Measured with Vitest (v8) in `api` and `shared`, and Jest in `app`. Run `pnpm test:coverage` at the root or in a package.
- **Changed code**: on every PR, `diff-cover` reads each package's `lcov.info` and fails when the lines the PR adds or changes are covered below the threshold (`shared` uses 80%, like the API). Files with no coverage data in the diff (docs, config, tests) do not count.
- **Global floor**: enforced by the test runner config, so it also runs locally. It blocks regressions only; raise it by hand when coverage grows.
- The app excludes routes (`src/app/**`) and `src/constants/mock-data.ts` from coverage: logic belongs in components, hooks and `lib`, where it is measured.
- `shared` has no global floor until it has tests.
- Baseline on 2026-10-09 (lines / branches / functions / statements): API 88 / 81 / 81 / 87 (83 tests), App 11 / 10 / 8 / 11 (6 tests), Shared 0 (no tests).
- CI uploads `lcov.info` and `coverage-summary.json` per package as the `coverage-<package>` artifact.

## PR checklist (authoring agent)

- [ ] Ticket linked, complexity level stated
- [ ] Risk label set, with one line explaining why
- [ ] Tests added or updated for the change
- [ ] Spec / ADR linked when complexity is high
- [ ] No secrets, no `.env` values, no commented out code
- [ ] Migration has a rollback path (when touching the database)

## Rules that never bend

- No one, human or agent, pushes directly to `main` or `develop`.
- A red check is never bypassed; fix it or close the PR.
- Changes to this file are always high risk.
