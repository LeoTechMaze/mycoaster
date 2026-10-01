# Coaster Tracker

Mobile app and social network for theme park and roller coaster enthusiasts.

**Positioning:** The coaster enthusiast's digital home — tracking, structured reviews, community gallery, and connection between enthusiasts and niche content creators.

**Platforms:** iOS and Android
**Stack:** React Native + **Expo (SDK 57)** · expo-router · TypeScript · Node.js + Express · PostgreSQL · Redis · Firebase Auth · n8n

---

## Repository structure

```
/apps/api     → Backend Node.js + Express (TypeScript)
/apps/app     → Expo / React Native app (TypeScript, expo-router file-based in apps/app/src/app/)
/packages/shared → TypeScript package shared between api and app (Zod schemas, no dist/)
/scraper      → n8n workflow configuration
/.specs       → All project documentation
  /.specs/project/    → Vision, roadmap and current state (spec-driven)
  /.specs/codebase/   → Technical mapping of the codebase (spec-driven)
```

---

## Documentation

### Product & Decisions

| Doc                                                                | Description                                                                     |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------|
| [.specs/docs/spec.md](.specs/docs/spec.md)                                   | Design spec — overview, target audience, architecture, features, phases and scope |
| [.specs/docs/data-model.md](.specs/docs/data-model.md)                       | Data model — tables, triggers, badges, ai_summary format              |
| [.specs/docs/api.md](.specs/docs/api.md)                                     | REST endpoints — routes, methods and descriptions                   |
| [.specs/docs/plan.md](.specs/docs/plan.md)                                   | Implementation plan — phases, prerequisites and parallelism           |
| [.specs/docs/decisions.md](.specs/docs/decisions.md)                         | Technical decisions — choices and their reasons                     |
| [.specs/docs/rcdb-n8n-scraper-spec.md](.specs/docs/rcdb-n8n-scraper-spec.md) | Design spec for the N8N scraper on RCDB                                        |

### Project (spec-driven — load when planning features)

| Doc                                                    | Description                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------|
| [.specs/project/PROJECT.md](.specs/project/PROJECT.md) | Vision, positioning, target audience and success metrics              |
| [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) | Phases 0–5 with status of each item                                      |
| [.specs/project/STATE.md](.specs/project/STATE.md)     | Persistent memory — decisions, blockers, lessons and next steps |

### Codebase (spec-driven — load when implementing)

| Doc                                                                | Description                                                                     |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------|
| [.specs/codebase/STACK.md](.specs/codebase/STACK.md)               | Full stack — runtimes, libs, versions and scripts                             |
| [.specs/codebase/ARCHITECTURE.md](.specs/codebase/ARCHITECTURE.md) | System architecture, auth flow, data flow                          |
| [.specs/codebase/STRUCTURE.md](.specs/codebase/STRUCTURE.md)       | Repository map — what's built vs. pending                       |
| [.specs/codebase/CONVENTIONS.md](.specs/codebase/CONVENTIONS.md)   | Code, DB, error handling and env var conventions                            |
| [.specs/codebase/INTEGRATIONS.md](.specs/codebase/INTEGRATIONS.md) | All external integrations (Firebase, Redis, n8n, storage, LLM)             |
| [.specs/codebase/TESTING.md](.specs/codebase/TESTING.md)           | Testing strategy                                              |
| [.specs/codebase/CONCERNS.md](.specs/codebase/CONCERNS.md)         | Identified technical risks — critical items to resolve before routes |

---

## Execution

Implementation tasks are tracked as **GitHub issues** in this repo (`LeoTechMaze/mycoaster`), organized by phase (0–5) with granular sub-tasks. (Previously tracked in ClickUp, board "🎢 HapFun — Produto"; migrated to GitHub issues — see `docs/agents/issue-tracker.md`.)

---

## Agent skills

### Issue tracker

Issues live as GitHub issues on `LeoTechMaze/mycoaster`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), used as-is. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily), alongside the existing `.specs/` docs. See `docs/agents/domain.md`.

---

## Language

All project documentation, tickets/issues, code comments, and commit messages are written in English, regardless of the language used in conversation. Proper nouns (ride names, place names, people's names in sample/mock data) are kept as-is.

---

## Conventions

- Badges stored in English in the DB (`rookie`, `enthusiast`, `veteran`, `legend`) — translated via i18n in the app
- Reviews weighted equally for all users
- Photos with moderation (status: pending → approved)
- Videos via YouTube URL only (no storage)
- AI processed in batch, cached as JSONB — no real-time calls
