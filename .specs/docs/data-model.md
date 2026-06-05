# MyCoaster — Data Model

---

## Tables

**users**

```
id              uuid PK
name            string
email           string unique
auth_provider   string          -- 'google' | 'apple' | 'email'
firebase_uid    string unique
credit_count    int default 0   -- denormalized counter, maintained via trigger
badge_level     string          -- 'rookie' | 'enthusiast' | 'veteran' | 'legend' (derived from credit_count; translated via i18n in app)
avatar_url      string nullable
instagram_url   string nullable
tiktok_url      string nullable
youtube_url     string nullable
is_premium      boolean default false
created_at      timestamp
```

**parks**

```
id              uuid PK
name            string
country         string
city            string
latitude        float
longitude       float
rcdb_id         string unique
status          string default 'operating'  -- 'operating' | 'sbno' | 'under_construction' | 'defunct'
                                            -- synced via RCDB scraper (g.htm?id= on park page)
ai_summary      jsonb nullable  -- { summary: string, tags: [...], generated_at: timestamp }
synced_at       timestamp
```

**coasters**

```
id              uuid PK
park_id         uuid FK → parks.id
name            string
rcdb_id         string unique
status          string default 'operating'  -- 'operating' | 'sbno' | 'under_construction' | 'defunct'
                                            -- derived from section heading on RCDB park page
ai_summary      jsonb nullable  -- { summary: string, tags: [...], generated_at: timestamp }
synced_at       timestamp
```

**user_credits**

```
id              uuid PK
user_id         uuid FK → users.id
coaster_id      uuid FK → coasters.id
ridden_at       timestamp
UNIQUE(user_id, coaster_id)     -- one credit per coaster per user
```

**reviews**

```
id              uuid PK
user_id         uuid FK → users.id
coaster_id      uuid FK → coasters.id  (nullable — null when reviewing a park)
park_id         uuid FK → parks.id     (nullable — populated via coaster.park_id when reviewing a coaster)
target_type     string                 -- 'coaster' | 'park'
rating          int                    -- 1 to 5 (overall rating given by user)
comment         string nullable
created_at      timestamp
updated_at      timestamp
UNIQUE(user_id, coaster_id) WHERE target_type = 'coaster'
UNIQUE(user_id, park_id) WHERE target_type = 'park'
```

**photos**

```
id              uuid PK
user_id         uuid FK → users.id
park_id         uuid FK → parks.id nullable
coaster_id      uuid FK → coasters.id nullable
image_url       string              -- URL in object storage (S3/R2)
status          string default 'pending'  -- 'pending' | 'approved' | 'rejected'
like_count      int default 0       -- denormalized for sorting
created_at      timestamp
```

**photo_likes**

```
id              uuid PK
user_id         uuid FK → users.id
photo_id        uuid FK → photos.id
created_at      timestamp
UNIQUE(user_id, photo_id)
```

**videos**

```
id              uuid PK
user_id         uuid FK → users.id
park_id         uuid FK → parks.id nullable
coaster_id      uuid FK → coasters.id nullable
youtube_url     string
thumbnail_url   string              -- extracted via YouTube API
title           string nullable
created_at      timestamp
```

---

## Credit Trigger

On INSERT into `user_credits` → increments `users.credit_count` and updates `badge_level` if threshold is reached.
On DELETE from `user_credits` → decrements `users.credit_count` and updates `badge_level` if needed.

---

## Badge Thresholds

| Badge      | Credits  |
| ---------- | -------- |
| rookie     | 0–49     |
| enthusiast | 50–149   |
| veteran    | 150–299  |
| legend     | 300+     |

_Initial values — may be adjusted based on real usage data._

---

## ai_summary Format (JSONB)

Stored in `parks.ai_summary` and `coasters.ai_summary`.

```json
{
  "summary": "Visitors praise the variety of attractions and theming...",
  "tags": [
    { "label": "Theming", "mentions": 89, "sentiment": "positive" },
    { "label": "Queues", "mentions": 72, "sentiment": "negative" },
    { "label": "Food", "mentions": 65, "sentiment": "mixed" }
  ],
  "review_count": 203,
  "generated_at": "2026-05-14T03:00:00Z"
}
```
