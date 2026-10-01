# Monorepo migration — rough draft (superseded)

> **Status: superseded.** This captured everything surfaced in a `/grill-with-docs`-style
> interview before the user paused to consider restarting planning with the `tdd` skill.
> The user has since resumed the original 8-ticket plan; the current version lives at
> [`monorepo-migration-tickets.md`](./monorepo-migration-tickets.md), updated to keep the
> same repo (`LeoTechMaze/mycoaster`) instead of moving to a new org, per the verified
> facts and decisions below. This file stays only as background on how that decision was
> reached — re-verify anything you pull from it, the repo will have moved on.

## Original request (pasted plan, verbatim)

The user pasted an 8-ticket ClickUp migration plan (pnpm workspace, `apps/api` + `apps/app` +
`packages/shared`, JS→TS port of the api) written for a prior session. It assumed:
creating a new GitHub org `mycoaster`, cloning the repo fresh, and a division of labor between
an agent on "Leo's machine" (no network) and Leo (org creation, push, `pnpm install`, simulators).

## Facts verified against the repo during this session (as of 2026-09-29/30)

- `origin` is already `git@github.com:LeoTechMaze/mycoaster.git` — the repo is already named
  `mycoaster`, under the `LeoTechMaze` account, not a separate GitHub org.
- `app/` was committed to `origin/develop` the same day (commit `b1530c4 chore: add mobile app`),
  but the local checkout used in this session was one commit behind and didn't have it yet.
- `api/src` is exactly 20 files / 921 lines (matches the plan's estimate).
- 6 route test suites exist under `api/tests/routes/` (matches "6 suítes de integração").
- `api/package.json` has `"zod": "^4.4.3"` and `"engines": { "node": ">=20" }`.
- `app/package.json` (as committed in `b1530c4`, not yet in this local tree) depends on
  `expo ^57.0.12`, `react-native 0.86.2`, `react 19.2.3`, uses **yarn** (`app/yarn.lock` present),
  and has **no** zod dependency yet — the "duplicate zod copy" risk from the plan is real but
  future, not current.
- No `pnpm-workspace.yaml`, no `apps/`/`packages/` layout, no root `package.json` exist yet —
  none of tickets 2–8 have started.
- This session's sandbox has network access but no `node`/`pnpm`/`yarn`/`corepack` installed —
  a different environment than the "Leo's machine, no network" one described in the pasted plan.
- `.claude/AGENTS.md` defines a Planner → Generator → Evaluator harness: every unit of work
  happens on its own `feat/`|`fix/`|`chore/<slug>` branch, agents may never write files on
  `develop`, and Generator follows `.specs/codebase/CONVENTIONS.md`, which currently mandates
  **CommonJS** — directly at odds with ticket 7's JS→TS port, so `CONVENTIONS.md` will need
  updating as part of (or right after) that step.
- `.specs/project/STATE.md`: Phase 1 backend is done; the only pending Phase 1 work is 13 Expo
  app UI vertical slices, none started yet. The migration is a parallel initiative layered on
  top of that backlog, not part of it.

## Decisions resolved during the interview (subject to being revisited under the new process)

1. **Destination repo**: `LeoTechMaze/mycoaster` is the actual destination. Drop the "create a
   new GitHub org + clone" step — treat this repo as-is. Re-parenting to a real org later is a
   cheap `git remote set-url`, not worth blocking on now.
2. **Execution split**: this session (or whichever agent plans/executes next) does planning and
   file/git work only; the user runs anything environment-dependent (`corepack enable`,
   `pnpm install`, `pnpm ios`/`android`, `git push`) on their own machine, since only it has the
   toolchain and simulators.
3. **Sync first**: pull `origin/develop` before starting anything else (plain fast-forward,
   brings in the already-committed `app/`).
4. **Branching**: one branch **per migration ticket**, merged to `develop` as each ticket's own
   exit criteria go green — not one long-lived branch for the whole migration. (This had been
   written up as `docs/adr/0001-per-ticket-branches-for-monorepo-migration.md`; that file has
   been folded into this rough draft and removed, since it was drafted mid-interview under a
   process the user has since asked to restart. Revisit whether this still deserves a standalone
   ADR once the new plan settles.)
5. **Sequencing vs. app work**: do the migration before starting the 13 pending Expo app slices,
   to avoid restructuring under in-flight feature branches.
6. **Node version**: pin `.nvmrc` to Node 22 (matches the actual dev machine); keep
   `engines: ">=20"` in each package as the wider compatibility floor.

## Open question at the point this session pivoted (resolved)

Whether each redesigned migration ticket should go through the repo's existing
Planner/Generator/Evaluator harness (a `.claude/plans/<slug>.md` per ticket, approved before any
code is written) — **resolved**: yes, for tickets 2–8, each on its own branch per decision 4
above, with a plan file and an Evaluator pass before merge. Ticket 1 is the exception — it has
no "Files to Change" (it's `git pull` + run the suite + record a baseline number), so it runs as
a plain verification step on `develop`, no plan file, no branch. See the "Processo de execução"
note in [`monorepo-migration-tickets.md`](./monorepo-migration-tickets.md).

## Where this leaves things

Resolved: the user chose not to restart planning from scratch. The original 8-ticket plan's
*scope* (workspace layout, shared package rules, Metro/pnpm risk, JS→TS port) stands, updated
only for decision 1 above (same repo, no new org/clone). See
[`monorepo-migration-tickets.md`](./monorepo-migration-tickets.md) for the current ticket text.
The open question about routing each ticket through the Planner/Generator/Evaluator harness
is still unanswered and should be settled before execution starts.
