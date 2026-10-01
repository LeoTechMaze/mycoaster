# Monorepo migration tickets — ClickUp (migrated to GitHub issues)

> Original destination: ClickUp list `🎢 MyCoaster` (901415818685), folder `🎡 HapFun`.
> The parent ticket was a subtask of **Phase 1 — MVP Launch** (`86b9yhn0p`).
> The 8 tickets below were subtasks of the parent ticket.
>
> **Status: complete and migrated.** All 8 tickets are done (see `.specs/project/ROADMAP.md`'s
> "Monorepo migration" section). This file is kept as historical record of the ticket text; the
> work itself now lives in GitHub issues per `docs/agents/issue-tracker.md`.

---

## PARENT TICKET — Migrate to pnpm + TypeScript monorepo

**Parent:** `86b9yhn0p` · **Priority:** high

### Goal

Reorganize the project as a pnpm workspace monorepo, create the `shared` package as the single
source of truth for contracts, and migrate the api from JavaScript to TypeScript. The concrete
payoff: the `core` validates the API response with the same Zod schema the `app` uses to parse
the return.

### Decisions made

1. **Same repository, no migration to a new org.** Stays at `git@github.com:LeoTechMaze/mycoaster.git`,
   branch `develop`. No new org, no new clone, no remote swap — the reorganization happens
   in-place. Full history preserved (no re-clone that could leave something behind).
2. **pnpm workspaces.** No Turborepo for now. Today the repo mixes npm (api) and yarn (app), and
   both lockfiles go.
3. **`apps/` + `packages/` layout.** `apps/api`, `apps/app`, `packages/shared`. `scraper/` stays at
   the root, outside everything, because it's n8n configuration, not code that imports types.
4. **The api migrates to TypeScript.** 20 files, 921 lines, currently CommonJS.
5. **`shared` is consumed directly from TypeScript source**, no `dist/`.

### Shared package rule

No platform-specific APIs: no Node's `fs`, `path`, `crypto`, no `window`, no `AsyncStorage`, no
`react-native`. Just plain JavaScript that runs in both environments. Zod comes in as a
`peerDependency` pinned to a single version, to avoid two copies in the bundle.

### Migration, not a rewrite

The api code is ported file by file, not rewritten from the documentation. Reason: fixes like
`guard PUT against 0-row update race`, `surface schema-level refine errors in 422 responses` and
`accept explicit null comment on create` live in the code, not in `.specs`. The 6 integration
suites are the safety net and need to stay green at every step.

Exceptions where a rewrite is intentional: `utils/schemas.js` moves house to `shared`, and
`config/env.js` becomes typed config.

### Known risks

- **Metro + pnpm.** The highest-risk part of the migration. It's not symlinks (RN 0.86 already
  supports them by default and `unstable_enableSymlinks` is no longer needed), it's pnpm's
  non-flat `node_modules`. Likely needs `extraNodeModules` or `node-linker=hoisted`.
  `disableHierarchicalLookup` tends to make things worse, not better.
- **The api resolving `shared`.** With `tsc`, TypeScript typechecks `shared` but doesn't emit its
  files because they're in `node_modules`, and the build comes out broken at runtime. Fix: `tsx`
  in dev and an esbuild bundle at build time, with `@mycoaster/shared` resolved via tsconfig
  `paths`.
- **Files ignored by git.** `api/.env` and `api/firebase-service-account.json` don't move with
  `git mv`. They need a plain `mv`.

### Out of scope

Moving the real schemas into `shared`, the app's services layer, and Turborepo. These become
their own tickets once the migration is green.

### Execution process

Tickets 2–8 go through the repo's Planner → Generator → Evaluator harness (`.claude/AGENTS.md`):
its own branch per ticket (`chore/<slug>` or `feat/<slug>`, per decision 4), a plan in
`.claude/plans/<slug>.md` approved before any code, and an Evaluator pass before merging into
`develop`.

**Ticket 1 is the exception.** It has no "Files to Change" — it's `git pull` + run the suite +
record a number — so it runs as a plain verification step directly on `develop`, no formal plan
and no branch of its own.

---

## 1. Baseline before the reorganization

**Depends on:** nothing · **Blocks:** ticket 2 · **No harness** (see "Execution process" above)

Prepare the ground before any structural change — no new repository.

- `git pull` (fast-forward) on `develop`: the remote already has `app/` committed (`b1530c4 chore: add mobile app`)
  which the local checkout might not have yet.
- Confirm a clean working tree before proceeding.
- Run `make up` and the api suite. **Record the green baseline in the ticket.** Without this
  number, there's no way to later prove the migration broke nothing.

**Done criteria:** local `develop` synced with `origin/develop` (with `app/` present), api suite
green, result recorded here.

**Baseline recorded (2026-09-30):**

- `git pull --ff-only origin develop`: fast-forward `99ba25f..b1530c4`, `app/` present. Clean
  working tree (only this session's untracked `docs/`, unrelated to the pull).
- `docker compose up -d`: `coaster_postgres` (postgres:16-alpine) and `coaster_redis`
  (redis:7-alpine) up.
- Api suite: **6 suites, 81 tests, all green**, 9.2s.
- Environment note: this sandbox had no Node installed — the suite ran inside a
  `node:20-alpine` container (`--network host`, `api/` mounted) to reach the compose services.
  `api/.env` didn't exist (it's gitignored) and was created locally from `.env.example` with a
  test `JWT_SECRET`; `FIREBASE_SERVICE_ACCOUNT_PATH` was left out — the Admin SDK doesn't
  initialize (just a warning) and no test depends on it, so it isn't a requirement for the suite
  to pass.

---

## 2. Root pnpm workspace

**Depends on:** ticket 1 · **Blocks:** ticket 3

Create the workspace layer without moving anything yet.

- `pnpm-workspace.yaml` with `apps/*` and `packages/*`.
- Root `package.json`, private, no product dependencies, just aggregator scripts that delegate
  via `pnpm --filter`.
- `tsconfig.base.json` with the shared options and `paths` mapping `@mycoaster/*` to
  `packages/*/src`. This mapping is what makes `tsx` resolve `shared` outside of `node_modules`,
  so it isn't cosmetic.
- `.npmrc`, `.nvmrc` with Node 22 (the machine's current version).
- Extend the root `.gitignore` to cover Expo (`.expo/`, `*.jks`, `ios/`, `android/`, `web-build/`)
  and pnpm.

**Done criteria:** files created and committed, nothing moved yet, api and app keep running as
before.

---

## 3. Reorganize folders into apps/ and packages/

**Depends on:** ticket 2 · **Blocks:** tickets 4 and 5

- `git mv api apps/api` and `git mv app apps/app`. `scraper/` stays where it is.
- **Watch out:** `api/.env` and `api/firebase-service-account.json` are git-ignored and don't move
  with `git mv`. They need a plain `mv`, otherwise the api comes up without credentials and the
  error shows up far from the cause.
- Update every reference to the old path: `Makefile` (has `cd api && npm run ...` in four
  targets), `docker-compose.yml`, `postman/`, `CLAUDE.md`, `.specs/codebase/STRUCTURE.md` and
  `.specs/codebase/STACK.md`.
- Rename the api package to `@mycoaster/api` and the app package to `@mycoaster/app`.

**Done criteria:** `make up` works, the api suite runs from the new path, `git log --follow`
still shows the history of the moved files.

---

## 4. Create packages/shared

**Depends on:** ticket 3 · **Blocks:** ticket 8

- `@mycoaster/shared` with `main` and `types` pointing to `src/index.ts`. No `dist/`.
- Structure: `src/index.ts` as a barrel, plus `src/schemas/`, `src/types/` and `src/constants/`.
- Zod as a `peerDependency` pinned to 4.4.3, the same version the api already uses. If the app
  installs a second copy, cross-schema checks and `instanceof ZodError` fail silently, and that's
  an expensive bug to find.
- A sample `Coaster` schema, just to serve as a resolution proof in ticket 8.
- No `fs`, `path`, `crypto`, `window`, `AsyncStorage` or `react-native`.

**Done criteria:** package created, `tsc --noEmit` clean on it.

---

## 5. Replace npm and yarn with pnpm, and fix up Metro

**Depends on:** ticket 3 · **Blocks:** ticket 8

The highest-risk ticket in the migration. The app currently works with yarn and Expo SDK 57, and
that's exactly what's being touched.

- Install pnpm via corepack (already available on the machine).
- Delete `apps/api/package-lock.json` and `apps/app/yarn.lock`. Delete both `node_modules`.
- `pnpm install` at the root.
- Write `apps/app`'s `metro.config.js` for RN 0.86's Metro: `watchFolders` including the workspace
  root, `nodeModulesPaths` pointing at both the root and local `node_modules`, and
  `extraNodeModules` to handle pnpm's non-flat layout.
- **Don't** use `unstable_enableSymlinks`: in RN 0.86 symlink support is already the default and
  the legacy flag is no longer needed.
- **Don't** flip on `disableHierarchicalLookup` by default. With pnpm it tends to make resolution
  worse. Only consider it if React duplication shows up, and confirm the duplication first in
  that case.
- Run `npx expo-doctor` and resolve whatever it flags.

**Done criteria:** `pnpm ios` and `pnpm android` bring the app up, no resolution error and no
React duplication. The api suite stays green.

---

## 6. TypeScript boilerplate for apps/api

**Depends on:** ticket 5 · **Blocks:** ticket 7

Set up the empty TS skeleton before bringing any code into it.

- `tsconfig.json` extending `tsconfig.base.json`, with `module: commonjs` as output. Changing the
  module format alongside the language would be two migrations in one commit.
- `strict: false` for this pass. Tightening it is gradual, in its own ticket, once everything is
  green.
- `tsx` for dev (`tsx watch src/index.ts`) and an esbuild bundle for the build. This combination
  is what lets `shared` stay without `dist/`.
- Lint and format aligned with the rest of the workspace.
- `allowJs: true` during the transition, so the api keeps running while files are ported one by
  one.

**Done criteria:** skeleton created, the still-JS api runs through it with no behavior change,
suite green.

---

## 7. Port the api from JavaScript to TypeScript

**Depends on:** ticket 6 · **Blocks:** ticket 8

20 files, 921 lines. Mechanical port, not a rewrite.

Suggested order, leaves to root, running the suite at every step:

1. `utils/` (`response`, `search`, `schemas`)
2. `config/` (`env`, `database`, `redis`, `firebase`, `knexfile`)
3. `middlewares/` (`auth`, `validate`, `errorHandler`)
4. `routes/` (`auth`, `users`, `parks`, `coasters`, `credits`, `reviews`, `index`)
5. `app.ts` and `index.ts`

Rules:

- `require` becomes `import`, behavior doesn't change. If a file calls for a refactor, that
  becomes a separate ticket.
- Tests stay in JS for now. They're the safety net and shouldn't change alongside what they test.
- No file is rewritten from `.specs`. Historical bug fixes aren't documented there and would be
  lost.

**Deliberate exceptions:** `utils/schemas.js` moves house to `shared` and gets a new shape there;
`config/env.js` becomes real typed config.

**Done criteria:** zero `.js` in `apps/api/src`, `allowJs` turned off, `tsc --noEmit` clean, the 6
integration suites green.

---

## 8. End-to-end resolution proof

**Depends on:** tickets 4, 5 and 7

The ticket that closes the migration. Without it passing, the setup isn't ready.

- The api imports the `Coaster` schema from `@mycoaster/shared` and validates a response with it.
  Runs in dev via `tsx` and in the build artifact via esbuild. **Both paths need to be tested**,
  because that's exactly where the absence of `dist/` in shared could break only at build time.
- The app imports the same schema and Metro includes it in the bundle, on iOS and Android.
- Confirm there's a single resolved copy of zod across the workspace.
- Update `CLAUDE.md` and `.specs` with the final structure.

**Done criteria:** api comes up in dev and in build consuming shared, app builds on both
platforms consuming the same schema, single zod.

---

## Note on execution

This session's `device_bash` runs on Leo's machine but **has no network access**. In practice:

- **I do:** write and edit files, `git mv`, local commits, porting the 20 files to TypeScript.
- **Leo does:** `git pull`, `git push`, `corepack` and `pnpm install`, booting the simulator for
  app tests.

Tickets 1 and 5 depend the most on this handoff.
