# STACK.md — MyCoaster

## Runtime & Language
- **Node.js** ≥ 20 (backend)
- **Backend:** JavaScript (CommonJS, no TypeScript)
- **App:** TypeScript — React Native + Expo (SDK 57), iOS + Android

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

## Mobile (`/app` — layout implemented, data layer pending)

Managed Expo project. Entry point is `expo-router/entry`; screens live in `app/src/app/`.

| Layer | Technology | Version |
|---|---|---|
| Framework | expo | ^57.0.12 |
| React Native | react-native | 0.86.2 |
| React | react | 19.2.3 |
| Language | typescript | ~6.0.3 |
| Navigation | expo-router (file-based) | ~57.0.9 |
| Tabs | `expo-router/unstable-native-tabs` (NativeTabs) | — |
| Animation | react-native-reanimated | 4.5.1 |
| Gestures | react-native-gesture-handler | ~2.32.0 |
| Screens / safe area | react-native-screens, react-native-safe-area-context | ~4.26.0 / ~5.7.0 |
| Vector drawing | react-native-svg | 15.15.4 |
| Typeface | @expo-google-fonts/space-grotesk | ^0.4.1 |
| Images | expo-image | ~57.0.1 |
| Splash | expo-splash-screen | ~57.0.5 |
| Native UI | @expo/ui, expo-glass-effect, expo-symbols | ~57.x |
| Linking / browser | expo-linking, expo-web-browser | ~57.x |

### Planned, not yet installed

- `@react-native-firebase/auth` (via Expo config plugin + dev client) — Google / Apple / email
- `expo-secure-store` — internal JWT persistence
- `expo-location` — GPS discovery
- Data fetching layer (React Query or SWR — decision open)
- `expo-image-picker` — Phase 3 photo uploads

### App scripts
```
yarn start          → expo start
yarn ios / android  → expo start --ios / --android
yarn lint           → expo lint
```

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
