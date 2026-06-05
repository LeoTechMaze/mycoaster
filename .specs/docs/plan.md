# MyCoaster — Implementation Plan

**Date:** 2026-05-15
**Status:** Approved

Granular tasks are tracked in **ClickUp** → Board "🎢 HapFun — Produto".

---

## Phases

### Phase 0 — Foundation (runs in parallel with all phases)

**Goal:** Base infrastructure ready and data populated.

- PostgreSQL + Redis setup
- Node.js + Express server with CI/CD
- n8n scraper running and populating parks and coasters from RCDB
- Staging/production environment setup

_The scraper must be running and have data before any app screen is tested._

### Phase 1 — MVP Launch

**Goal:** Functional app that already delivers value and starts accumulating reviews.

- Authentication (Firebase Auth — Google, Apple, email/password)
- Park and coaster discovery (GPS + city/country search)
- Coaster listing by park
- Credit system (mark/unmark coaster as ridden)
- User profile with credit count and history
- Simple review: overall rating 1–5 + free-text comment
- Park and coaster reviews

### Phase 2 — Competition & Retention

**Goal:** Turn the app from an individual tool into a social and competitive experience.

- Global leaderboard (Redis cache)
- Visual badges by credit level (Rookie, Enthusiast, Veteran, Legend)
- Achievement sharing (native share sheet)
- Public profile with links to Instagram, TikTok, and YouTube

### Phase 3 — Community Content

**Goal:** Turn park and coaster pages into rich spaces with visual content.

**Prerequisite:** Active user base (Phases 1 and 2 consolidated).

- Photo gallery per park and coaster (upload with per-period limit)
- Videos via YouTube URL linked to park/coaster
- Photo likes system
- Carousel sorted by likes + recency
- Basic moderation pipeline (delay + community report)
- Cold start strategy: seed content from creator + launch campaign on channels

### Phase 4 — AI Intelligence

**Goal:** Add value on top of the accumulated review mass.

**Prerequisite:** Critical mass of reviews (minimum ~10 per park/coaster for activation).

- AI review summaries (Amazon "Customers say" style)
- Thematic tags extracted from comments with mention count and sentiment
- Clickable tags that filter reviews by theme
- Periodic batch job with output cached as JSONB

### Phase 5 — Monetization

**Goal:** Generate revenue after proven retention.

**Prerequisite:** Engagement and retention validated in previous phases.

- Premium subscription (higher upload limits, advanced stats, custom profile)
- Geolocated coupons with proximity notification (requires park partnerships)
- Hotel affiliate links near parks

---

## Phase Parallelism

- Phase 0 runs in parallel with all development
- Phase 4 backend (AI) can be prepared during Phase 3 but only activated with sufficient data
- Commercial negotiation for coupons (Phase 5) can begin during Phase 2 or 3

---

## Priorities

| Phase | Priority | Dependencies |
|---|---|---|
| 0 — Foundation | P0 | — |
| 1 — MVP Launch | P0 | Phase 0 |
| 2 — Competition & Retention | P1 | Phase 1 |
| 3 — Community Content | P2 | Phases 1 and 2 |
| 4 — AI Intelligence | P2 | Phase 3 (accumulated reviews) |
| 5 — Monetization | P3 | Phases 1–4 (proven retention) |

---

## Tooling Stack

| Category | Tool |
|---|---|
| Backend framework | Node.js + Express |
| Query builder | knex.js |
| Auth SDK | firebase-admin |
| Cache | ioredis |
| App navigation | React Navigation |
| Mobile auth | @react-native-firebase/auth |
| HTTP client | axios |
| Share | react-native-share |
| Scraper | n8n (self-hosted) |
| Local DB dev | Docker Compose |
| Object storage | S3 or Cloudflare R2 (TBD) |
