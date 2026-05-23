# MyCoaster — Modelo de Dados

---

## Tabelas

**users**

```
id              uuid PK
name            string
email           string unique
auth_provider   string          -- 'google' | 'apple' | 'email'
firebase_uid    string unique
credit_count    int default 0   -- contador desnormalizado, atualizado via trigger
badge_level     string          -- 'rookie' | 'enthusiast' | 'veteran' | 'legend' (derivado de credit_count; traduzido via i18n no app)
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
status          string default 'operating'  -- 'operating' | 'under_construction' | 'defunct'
                                            -- sincronizado via scraper RCDB (g.htm?id= da página do parque)
                                            -- defunct cobre tanto Defunct quanto SBNO
ai_summary      jsonb nullable  -- { summary: string, tags: [...], generated_at: timestamp }
synced_at       timestamp
```

**coasters**

```
id              uuid PK
park_id         uuid FK → parks.id
name            string
rcdb_id         string unique
ai_summary      jsonb nullable  -- { summary: string, tags: [...], generated_at: timestamp }
synced_at       timestamp
```

**user_credits**

```
id              uuid PK
user_id         uuid FK → users.id
coaster_id      uuid FK → coasters.id
ridden_at       timestamp
UNIQUE(user_id, coaster_id)     -- um crédito por coaster por usuário
```

**reviews**

```
id              uuid PK
user_id         uuid FK → users.id
coaster_id      uuid FK → coasters.id  (nullable — se for review de parque, coaster_id é null)
park_id         uuid FK → parks.id     (nullable — se for review de coaster, preenchido via coaster.park_id)
target_type     string                 -- 'coaster' | 'park'
rating          int                    -- 1 a 5 (nota geral dada pelo usuário)
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
image_url       string              -- URL no storage (S3/R2)
status          string default 'pending'  -- 'pending' | 'approved' | 'rejected'
like_count      int default 0       -- desnormalizado para ordenação
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
thumbnail_url   string              -- extraído via YouTube API
title           string nullable
created_at      timestamp
```

---

## Trigger de crédito

Ao inserir em `user_credits` → incrementa `users.credit_count` e atualiza `badge_level` se atingir threshold.  
Ao deletar de `user_credits` → decrementa `users.credit_count` e atualiza `badge_level` se necessário.

---

## Thresholds de badges

| Badge      | Créditos |
| ---------- | -------- |
| rookie     | 0–49     |
| enthusiast | 50–149   |
| veteran    | 150–299  |
| legend     | 300+     |

_Valores iniciais — podem ser ajustados com base nos dados reais de uso._

---

## Formato do ai_summary (JSONB)

Salvo nos campos `parks.ai_summary` e `coasters.ai_summary`.

```json
{
  "summary": "Os visitantes elogiam a variedade de atrações e a tematização...",
  "tags": [
    { "label": "Tematização", "mentions": 89, "sentiment": "positive" },
    { "label": "Filas", "mentions": 72, "sentiment": "negative" },
    { "label": "Alimentação", "mentions": 65, "sentiment": "mixed" }
  ],
  "review_count": 203,
  "generated_at": "2026-05-14T03:00:00Z"
}
```
