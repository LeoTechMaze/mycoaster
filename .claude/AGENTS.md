# AGENTS.md — MyCoaster Dev Harness

This file defines the three agent roles used in MyCoaster development, plus the git discipline
rules enforced by the harness. Load this file at the start of every session.

---

## Planner

**When to invoke:** `/planner` — at the start of every new feature or non-trivial task.

**Inputs:**
- Feature description from the user
- Relevant ROADMAP phase (`.specs/project/ROADMAP.md`)
- Spec docs: `.specs/codebase/ARCHITECTURE.md`, `CONVENTIONS.md`, `CONCERNS.md`

**Process:**
1. Read `ROADMAP.md` to confirm the feature belongs to the active phase
2. Read `ARCHITECTURE.md` and `CONVENTIONS.md` to understand constraints
3. Read all files that will be affected
4. Write plan to `.claude/plans/<slug>.md`
5. Update `.claude/progress.md` with the active feature + plan reference
6. Enter plan mode and request user approval before any code is written

**Plan file format** (`.claude/plans/<slug>.md`):
```markdown
# Plan: <feature name>

## Context
Why this feature exists, which ROADMAP phase it belongs to.

## Feature List
Bulleted list of behaviors this implementation must deliver.

## Testable Criteria
- [ ] Each criterion maps to one verifiable behavior
- [ ] Written so the Evaluator can check them one by one

## Approach
How to implement — key decisions, patterns to follow.

## Files to Change
- path/to/file.js — what changes and why

## Verification
How to manually verify the feature works end-to-end.
```

**Gate:** Plan must be approved by the user (ExitPlanMode) before any code is written.

---

## Generator

**When to invoke:** `/generator` — after the Planner's plan is approved.

**Inputs:**
- Approved plan at `.claude/plans/<slug>.md`
- Files listed in the plan's "Files to Change" section
- `.specs/codebase/CONVENTIONS.md` and `ARCHITECTURE.md`

**Process:**
1. Read `.claude/progress.md` to find the active plan
2. Block and warn if no approved plan is found
3. Read the plan and all files it references
4. Implement following CONVENTIONS.md strictly (CommonJS, 2-space indent, single quotes, etc.)
5. Update the Done/In Progress checklist in `.claude/progress.md` after each file

**Constraint:** Must not write or edit code files without an active approved plan.

---

## Evaluator

**When to invoke:** `/evaluator` — after Generator finishes, or at any point to review a diff.
Supports `--fix` flag to apply minor corrections automatically.

**Inputs:**
- Current diff (`git diff HEAD`)
- Active plan from `.claude/progress.md`
- `.specs/codebase/CONVENTIONS.md`
- `.specs/codebase/CONCERNS.md`

**Process:**
1. Read `.claude/progress.md` to load the active plan
2. Run through each Testable Criterion in the plan — pass / fail / partial
3. Check code against CONVENTIONS.md (naming, structure, error handling)
4. Check for any open CONCERNS.md items that this change should address
5. Produce a structured report

**Output format:**
```
## Evaluation: <feature name>

**Verdict:** approved | approved-with-caveats | rejected

### Testable Criteria
- [x] <criterion> — PASS
- [ ] <criterion> — FAIL: <reason>

### Convention Issues
- <issue> at <file>:<line>

### Open Concerns Addressed
- C-00X: addressed / not addressed / partially addressed

### Required Changes (if rejected or caveats)
1. <specific change required>
```

---

## Git Discipline

Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `ci/<slug>`, `docs/<slug>`

### Commit message format — Conventional Commits
Reference: https://www.conventionalcommits.org/en/v1.0.0/

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Allowed types:**
- `feat` — new feature (MINOR in semver)
- `fix` — bug fix (PATCH in semver)
- `refactor` — code change with no behavior change
- `chore` — maintenance, dependencies, config
- `docs` — documentation only
- `test` — adding or updating tests
- `ci` — CI/CD pipeline changes
- `perf` — performance improvement
- `style` — formatting only, no logic change

**Breaking changes:** append `!` after type (`feat!:`) OR add `BREAKING CHANGE: <description>`
footer. Both map to MAJOR in semver.

**Rules:**
- Description: lowercase, imperative mood, under 72 chars, no period at end
- Body: one blank line after description; explain WHY, not WHAT
- AI-assisted commits must include footer: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Commits only after Evaluator approval or explicit user override
- No `--force` push to `main` or `develop` (blocked by harness git guard hook)

**Examples:**
```
feat(auth): add POST /auth/login with Firebase token validation

fix(credits): prevent duplicate entry on rapid double-tap

chore: update knex to 3.1.0

feat!(auth): change JWT payload structure

BREAKING CHANGE: clients must read display_name instead of user_name

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
