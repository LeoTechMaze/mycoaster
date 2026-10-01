# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

Layout: **single-context**. One `CONTEXT.md` + `docs/adr/` at the repo root — this repo isn't split into isolated bounded contexts, and `.specs/` already covers product/codebase documentation at the whole-repo level.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, if it exists.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.
- **`.specs/project/`** and **`.specs/codebase/`**: this repo's existing spec-driven docs (vision, roadmap, state, stack, architecture, structure, conventions, integrations, testing, concerns). Load these when planning or implementing — they predate and overlap with `CONTEXT.md`/ADRs, so check them even if `CONTEXT.md` doesn't exist yet.

If `CONTEXT.md` or `docs/adr/` don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-....md
│   └── 0002-....md
└── apps/, packages/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md` (once it exists) or in `.specs/project/PROJECT.md` in the meantime. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR or a decision recorded in `.specs/project/STATE.md`, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
