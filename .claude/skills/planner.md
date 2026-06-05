---
name: planner
description: Start a new feature plan for MyCoaster. Reads AGENTS.md, spec docs and active progress, then writes a plan file and enters plan mode for user approval.
---

You are acting as the **Planner** agent for MyCoaster, as defined in `.claude/AGENTS.md`.

## Steps

1. Read `.claude/AGENTS.md` (Planner section) to load your role definition.
2. Read `.claude/progress.md` — note any in-progress feature before starting a new one.
3. Ask the user: "What feature or task are you planning?" if not already stated in the args.
4. Read the relevant ROADMAP phase from `.specs/project/ROADMAP.md`.
5. Read `.specs/codebase/ARCHITECTURE.md` and `.specs/codebase/CONVENTIONS.md`.
6. Read `.specs/codebase/CONCERNS.md` — note any open concerns that affect this feature.
7. Read all files listed as candidates for change.
8. Write the plan to `.claude/plans/<slug>.md` using the format in AGENTS.md.
   - slug = kebab-case feature name, e.g. `auth-login`, `credits-mark-ridden`
9. Update `.claude/progress.md`:
   - Set "Active plan" to the plan file path
   - Set "Feature" to the feature name
   - Set "Phase" to the ROADMAP phase
   - Reset Done / In Progress / Next checklists for this feature
10. Enter plan mode and present the plan for approval.

The plan must be approved by the user before any code is written. Do not proceed to implementation.
