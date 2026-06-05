# 🎢 MyCoaster

> The coaster enthusiast's digital home — track every coaster you've ridden, rate parks and coasters, explore community content, and compete on a global leaderboard.

**Status:** Phase 0 complete · Phase 1 (MVP API) in progress  
**Built with:** Claude Code (AI-assisted development) · [See build metrics →](METRICS.md)

---

## What It Is

MyCoaster is a mobile app and social platform for theme park and roller coaster enthusiasts. Users can:

- **Track** every coaster they've ridden and accumulate credits
- **Rate** parks and coasters (1–5 stars + free-text reviews)
- **Discover** nearby parks and coasters via GPS or city/country search
- **Compete** on a global leaderboard ranked by credit count
- **Share** community photos and YouTube video links
- **Connect** with other enthusiasts via public profiles

**Initial market:** Brazil · **Expansion:** Global

---

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (no Expo) — iOS + Android |
| API | Node.js + Express |
| Database | PostgreSQL (knex) |
| Cache | Redis (ioredis) |
| Auth | Firebase Auth → internal JWT |
| Scraper | n8n (self-hosted) — daily RCDB sync |
| CI/CD | GitHub Actions → EasyPanel (staging) |
| AI (Phase 4) | LLM batch job — review summaries + tags |

---

## Repository Structure

```
/api        → Node.js + Express REST API
/app        → React Native app (coming Phase 1)
/scraper    → n8n RCDB scraper workflow (JSON)
/.specs     → Full project documentation (spec-driven)
```

---

## Current State

### ✅ Phase 0 — Foundation (complete)

- PostgreSQL schema — 8 tables, 12 migrations, PL/pgSQL credit trigger
- Express API base — env validation, Firebase Admin, Zod, Morgan, auth middleware
- Docker Compose for local development
- CI/CD pipeline — auto-deploy to staging on push to `develop`
- Staging environment live on EasyPanel (PostgreSQL + Redis)
- n8n RCDB scraper — populates parks + coasters daily
- Dev seed — real RCDB data (Canada's Wonderland + Hopi Hari)

### 🔄 Phase 1 — MVP API (in progress)

- `POST /auth/login` — Firebase token exchange → internal JWT
- `GET /parks` — discovery by GPS or city/country
- `GET /coasters/:id` — coaster detail
- `POST /credits` — mark coaster as ridden
- `POST /reviews` — rate parks and coasters
- React Native app scaffold

### Upcoming

| Phase | Goal |
|---|---|
| 2 | Leaderboard, badges, social profiles |
| 3 | Community photos + YouTube videos |
| 4 | AI-generated review summaries + tags |
| 5 | Premium subscription + geolocated coupons |

---

## Running Locally

**Prerequisites:** Docker, Node.js ≥ 20

```bash
# 1. Clone and install
git clone https://github.com/LeoTechMaze/mycoaster.git
cd mycoaster/api && npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start infrastructure
make up

# 4. Run migrations + seed
make migrate
make seed

# 5. Start API
npm run dev

# 6. Verify
curl http://localhost:3000/health
# → {"status":"ok","postgres":"up","redis":"up"}
```

---

## Documentation

| Doc | Description |
|---|---|
| [.specs/docs/spec.md](.specs/docs/spec.md) | Product design spec — vision, features, scope |
| [.specs/docs/data-model.md](.specs/docs/data-model.md) | Database schema — tables, triggers, badges |
| [.specs/docs/api.md](.specs/docs/api.md) | REST endpoint reference |
| [.specs/codebase/ARCHITECTURE.md](.specs/codebase/ARCHITECTURE.md) | System architecture + data flows |
| [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) | Phase-by-phase roadmap with status |
| [METRICS.md](METRICS.md) | Build velocity + AI-assisted development metrics |

---

## AI-Assisted Development Methodology

This project is built using **Claude Code** with two engineering practices that go beyond "AI autocomplete":

### Spec-Driven Development
Every feature starts as a written spec before a single line of code is written. The [`.specs/`](.specs/) directory contains 16 documents covering architecture, data model, API contracts, conventions, integrations, and technical concerns. Claude Code reads these specs as context on every session — decisions stay consistent across weeks and multiple sessions without re-explaining the codebase each time.

```
.specs/
├── docs/          → spec.md, data-model.md, api.md, plan.md, decisions.md
├── codebase/      → ARCHITECTURE.md, CONVENTIONS.md, STACK.md, CONCERNS.md
└── project/       → ROADMAP.md, STATE.md, PROJECT.md
```

### Harness Engineering
The Claude Code harness is configured with custom agents, skill files, and session hooks in [`.claude/`](.claude/). This defines how the AI agent plans, generates, and evaluates work — enforcing Git discipline, code conventions, and spec alignment automatically on every task.

```
.claude/
├── AGENTS.md      → Planner / Generator / Evaluator agent contracts
├── skills/        → /planner, /generator, /evaluator skill definitions
└── init.sh        → Session bootstrap script
```

### Build Metrics
Every phase is tracked in [METRICS.md](METRICS.md) with commit counts, lines of code, active sessions, and estimated time savings vs. traditional development.

---

## License

MIT
