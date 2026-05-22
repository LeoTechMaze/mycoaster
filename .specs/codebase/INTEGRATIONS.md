# INTEGRATIONS.md — MyCoaster

## Firebase Auth
- **SDK:** `firebase-admin` ^13.10.0 (server-side)
- **Mobile:** `@react-native-firebase/auth` (planned, not yet installed)
- **Flow:** Firebase ID token → `POST /auth/login` → server-issued JWT
- **Config:** Service account credentials via env vars (Firebase Admin SDK standard)
- **Supported providers:** Google OAuth, Apple OAuth, email/password

## PostgreSQL
- **Driver:** `pg` via `knex`
- **Connection:** `DATABASE_URL` (prod, with SSL) or individual `POSTGRES_*` env vars (dev)
- **Pool:** min 2, max 10 connections
- **Migrations:** managed by knex, stored in `api/migrations/`

## Redis (ioredis)
- **Use:** Leaderboard cache (`GET /leaderboard`)
- **Connection:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Pattern:** Lazy connect; exponential retry up to 2s delay
- **Cache invalidation:** When a user gains/loses a credit (trigger fires → API must update Redis)
  - ⚠️ Currently the trigger updates the DB but there's no code yet to invalidate Redis — needs to be wired up in the credits route

## n8n (RCDB Scraper)
- **Deployment:** Self-hosted at `techmaze-n8n.qokhkh.easypanel.host`
- **Workflow ID:** `ODfn4gK0Zo1stLsp`
- **Schedule:** Daily cron `0 3 * * *` (03:00 UTC)
- **Scope:** Brazil initially; expandable to global via `countries` array in Set node
- **DB access:** Connects directly to PostgreSQL (needs same connection credentials)
- **Rate limiting:** 500ms between listing pages, 1–2s between park page fetches
- **Workflow JSON:** `/scraper/rcdb-workflow.json` (importable into n8n)

## Object Storage (TBD)
- **Options:** AWS S3 or Cloudflare R2
- **Use:** Community photo uploads
- **Not yet integrated** — decision and SDK setup pending

## YouTube API / oEmbed
- **Use:** Extract `thumbnail_url` and `title` when user submits a YouTube URL for a video
- **Approach:** YouTube oEmbed endpoint (`https://www.youtube.com/oembed?url=...&format=json`) — no API key required for oEmbed
- **Not yet integrated**

## LLM API (AI Batch — Phase 4)
- **Options:** Anthropic Claude or OpenAI GPT (TBD)
- **Use:** Generate `ai_summary` JSONB for parks and coasters with ≥10 reviews
- **Pattern:** Batch job (cron), results persisted to DB — no real-time calls
- **Not yet integrated**
