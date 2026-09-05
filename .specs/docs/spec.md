# MyCoaster — Design Spec v2

**Date:** 2026-05-14
**Status:** Approved

---

## Overview

Mobile app and social network for theme park and roller coaster enthusiasts. Lets users discover nearby parks and coasters (or anywhere in the world), track coasters they've ridden by accumulating credits, rate parks and coasters with reviews and scores, explore community photo and video galleries, compete on a global leaderboard, and connect with other enthusiasts.

**Positioning:** The coaster enthusiast's digital home — tracking, structured reviews, community gallery, and connection between enthusiasts and niche content creators.

**Platforms:** iOS and Android
**Stack:** React Native + Expo (SDK 57) · expo-router · TypeScript · Node.js + Express · PostgreSQL · Redis · Firebase Auth · n8n

---

## Target Audience

Roller coaster and theme park enthusiasts who want to track ridden coasters, rate experiences, share visual content, plan visits to new parks, and compare their progress with other enthusiasts. Initial focus on the Brazilian market, with international expansion as a future horizon.

---

## Architecture

### Components

| Component            | Technology                        | Responsibility                                   |
| -------------------- | --------------------------------- | ------------------------------------------------ |
| Mobile app           | React Native + Expo (SDK 57)      | UI, GPS, navigation, camera, share               |
| API Server           | Node.js + Express                 | Business logic, REST endpoints                   |
| Database             | PostgreSQL                        | Primary persistence                              |
| Cache                | Redis                             | Global leaderboard, frequently read data         |
| Auth provider        | Firebase Auth                     | OAuth Google/Apple + email/password              |
| Scraper              | n8n                               | Periodic sync of RCDB data                       |
| Media storage        | TBD (e.g. S3, Cloudflare R2)      | Community photos                                 |
| AI (batch)           | LLM API (e.g. Claude/GPT)         | Review summaries and thematic tag extraction     |

### Main Flow

1. App authenticates via Firebase Auth → receives JWT
2. JWT is validated by the backend on every request
3. App consumes REST API for parks, coasters, credits, reviews, gallery, and leaderboard
4. n8n workflow runs periodically, scrapes RCDB, and updates data in PostgreSQL via upsert
5. Leaderboard is cached in Redis and invalidated when a user earns a credit
6. AI batch job runs periodically, processes reviews, and generates summaries + thematic tags cached in the DB

---

## RCDB Scraper (n8n)

### Strategy

- n8n workflow scheduled via time trigger (once daily, overnight)
- Scrapes rcdb.com and fetches list of parks + coasters per park
- Data collected: park name, city, country, lat/lng, list of coasters (name only)
- Upsert into PostgreSQL using `rcdb_id` as key — never duplicates
- n8n handles retries and error logs natively

### Fields Collected

- Park: `name`, `country`, `city`, `latitude`, `longitude`, `rcdb_id`, `status`
- Coaster: `name`, `park_id`, `rcdb_id`, `status`

### Coaster and Park Status Values

Possible values: `operating`, `sbno`, `under_construction`, `defunct`

- **operating** — running normally
- **sbno** — Standing But Not Operating; physically present but temporarily stopped (extended maintenance, may return)
- **under_construction** — being built, not yet open
- **defunct** — permanently closed

Park status is extracted from the first `g.htm?id=` link on the RCDB park page.
Each coaster's status is derived from the section it appears in on the park page (`<h4>Operating Roller Coasters`, `<h4>SBNO Roller Coasters`, etc.).

---

## AI — Summaries and Thematic Tags

### Overview

A periodic batch job processes free-text reviews and generates two outputs for each park and coaster: a text summary and a set of thematic tags with mention count and sentiment (positive/negative/mixed).

### Rules

- Only generated when there are at least 10 reviews for the park or coaster
- Runs periodically (e.g. weekly) or when N new reviews have accumulated since last generation
- Output saved as JSONB in the `ai_summary` field of the park or coaster
- App reads the cached JSON — no real-time AI calls

### Expected Tags (not fixed — emerge from comments)

**For parks:** Theming, Queues, Food, Service, Infrastructure, Value, Cleanliness, Parking, etc.
**For coasters:** Adrenaline, Smoothness, Roughness, Theming, Queue, Comfort, Excitement, Nausea, etc.

### UI

- Summary displayed at the top of the park/coaster reviews section
- Clickable tags below the summary — clicking filters reviews that mention the theme
- Label "AI-generated from community reviews" visible

---

## Photo Gallery

### Upload Rules

- Each user can submit up to 3 photos per park and 3 per coaster, per period (e.g. per month)
- Premium users can submit up to 6 photos per park/coaster per period
- Photos enter with `pending` status and become visible after moderation (initially: delay + community report)
- On upload, user grants a usage license for the image in the app gallery, with authorship credited

### Carousel Sorting

Display priority based on: likes (higher weight) + recency (newer photos rise) — paginated loading to limit traffic.

### Cold Start

- Before the feature launches, galleries for major parks are populated with content from the team/creator
- Parks without photos display a CTA: "Visited this park? Be the first to share a photo!"
- Launch campaign on creator's channels (YouTube/Instagram) to activate the community

---

## Videos

### Rules

- Only YouTube URLs are accepted (no server-side video storage)
- Thumbnail and title extracted automatically via YouTube oEmbed/API
- Linked to a park and/or coaster
- Displayed in the videos section of the park or coaster profile

---

## Review System

### User Flow

1. User selects a park or coaster
2. Gives an overall rating of 1 to 5 stars
3. Writes a free-text comment (optional, but encouraged)
4. Submits — one review per park and one per coaster per user

### Ratings

- Park/coaster average rating is calculated democratically — all votes have equal weight
- User's badge (Rookie, Enthusiast, Veteran, Legend) is displayed next to their name on the review, letting readers assess the experience level of the reviewer
- No differentiated weight for paying users or users with more credits

---

## User Profile

### Data Displayed

- Name, avatar, badge level
- Credit count and ridden coaster history
- Links to Instagram, TikTok, and YouTube (optional)
- Photos submitted to the gallery
- Linked videos
- Written reviews

### Public Profile

Any user can visit another's profile and see credits, badge, social links, shared photos, and videos.

---

## Monetization (future phase)

### Premium Subscription

- Higher photo upload limit per period
- Advanced profile stats (e.g. coaster distribution by country, type, etc.)
- Custom profile
- No ads

### Geolocated Coupons

- When the user is near a partner park, they receive a discount coupon suggestion
- Commission model on conversions
- Requires individual commercial partnerships with each park

### Hotel Affiliates

- Accommodation suggestions near parks via affiliate programs (e.g. Booking, Hotels.com)
- Commission on bookings made via app link

---

## Out of Scope (all phases)

- Coaster filtering by type, height, or speed
- Coaster technical data (name only)
- Friend activity feed / timeline
- Push notifications
- Offline mode
- Server-side video storage (YouTube URLs only)
- Weighted ratings for paying users or users with more credits
- Fixed review subcategories (replaced by AI-emergent tags)
