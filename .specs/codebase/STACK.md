# STACK.md — MyCoaster

## Runtime & Language
- **Node.js** ≥ 20 (backend)
- **JavaScript** (CommonJS, no TypeScript)
- **React Native** (no Expo) — iOS + Android

## Backend
| Layer | Technology | Version |
|---|---|---|
| Framework | Express | ^4.19.2 |
| Async error handling | express-async-errors | ^3.1.1 |
| Security headers | helmet | ^7.1.0 |
| CORS | cors | ^2.8.5 |
| Query builder | knex | ^3.1.0 |
| PostgreSQL driver | pg | ^8.12.0 |
| Redis client | ioredis | ^5.4.1 |
| Auth SDK | firebase-admin | ^13.10.0 |
| JWT (internal) | jsonwebtoken | ^9.0.2 |
| UUIDs | uuid | ^10.0.0 |
| Env vars | dotenv | ^16.4.5 |

## Dev Dependencies
- **nodemon** ^3.1.4 — hot reload in dev

## Database
- **PostgreSQL** — primary store; UUIDs as PKs (`gen_random_uuid()`); timezone-aware timestamps
- **Redis** — leaderboard cache; lazy-connect with retry strategy

## Auth Flow
- Mobile authenticates via **Firebase Auth** (Google / Apple / email)
- Firebase token exchanged at `POST /auth/login` → server issues own **JWT** (`JWT_SECRET`)
- All protected routes validate JWT via `authenticate` middleware

## Scraper
- **n8n** (self-hosted) — scheduled workflow scraping RCDB daily at 03:00 UTC
- Upserts `parks` and `coasters` using `rcdb_id` as idempotency key

## Mobile (planned — no code yet)
- React Navigation
- @react-native-firebase/auth
- axios
- react-native-share

## Object Storage
- **TBD** — AWS S3 or Cloudflare R2 for community photo uploads

## AI / Batch
- **TBD** — LLM API (Claude or GPT) for review summaries + tag extraction; batch job, results cached as JSONB

## Scripts
```
npm start           → node src/index.js
npm run dev         → nodemon src/index.js
npm run migrate:latest
npm run migrate:rollback
npm run migrate:make
```
