# Spec: RCDB Scraper — n8n Workflow
**Project:** MyCoaster
**ClickUp Task:** [86b9zev0u — Configure and implement RCDB scraper](https://app.clickup.com/t/86b9zev0u)
**n8n Workflow:** https://techmaze-n8n.qokhkh.easypanel.host/workflow/ODfn4gK0Zo1stLsp
**Date:** 2026-05-16
**Status:** Ready for implementation

---

## Goal

Implement an n8n workflow that periodically scrapes the RCDB website (rcdb.com) and populates the `parks` and `coasters` tables in PostgreSQL via upsert, using `rcdb_id` as the idempotency key.

---

## How RCDB Works

### URL Structure

RCDB uses sequential numeric IDs for **all** pages:

```
https://rcdb.com/1.htm       → may be a coaster (e.g. Raptor)
https://rcdb.com/4529.htm    → may be a park (e.g. Cedar Point)
```

The same `/{id}.htm` pattern serves both parks and coasters. **There is no prefix or namespace separation between the two types.**

### Distinguishing Park Pages from Coaster Pages

The distinction is in the `<title>` of the page:

| Type | `<title>` format | Example |
|------|-----------------|---------|
| **Coaster** | `{Name} - {Park} ({City}, {State}, {Country})` | `Raptor - Cedar Point (Sandusky, Ohio, United States)` |
| **Park** | `{Name} ({City}, {State}, {Country})` | `Cedar Point (Sandusky, Ohio, United States)` |

**Practical rule:** if the `<title>` contains ` - ` separating two names, it's a coaster. If it starts directly with the park name followed by parentheses, it's a park.

---

## Scraping Strategy: Listing Pages (not sequential ID iteration)

### ❌ Inefficient Approach (DO NOT use)

Iterating `/1.htm`, `/2.htm`, `/3.htm`... up to the highest ID (~23,000+). This would generate 23,000+ unnecessary requests, most for coasters (which can be obtained via park pages).

### ✅ Correct Approach: Use RCDB listing pages

RCDB provides paginated listing pages that aggregate coasters by filter. The key URL is:

```
https://rcdb.com/r.htm?ot=2&ol={location_id}&page={n}
```

- `ot=2` → type "Roller Coasters"
- `ol={location_id}` → filter by location (country, state, city)
- `page={n}` → pagination (starts at 1; omitting `page=` returns page 1)

#### Relevant Location IDs

| Country | `location_id` |
|---------|--------------|
| Brazil  | `26724`       |
| World (all) | *(omit `ol=`)* |

Example for all coasters in Brazil:
```
https://rcdb.com/r.htm?ot=2&ol=26724&page=1
https://rcdb.com/r.htm?ot=2&ol=26724&page=2
...
https://rcdb.com/r.htm?ot=2&ol=26724&page=9
```

Brazil has **212 coasters** across **9 pages** (~24 per page).

For global coverage: **13,219 coasters** across **551 pages**.

---

## What Each Page Type Contains

### Listing Page (`r.htm?ot=2&ol=...`)

Each table row contains:
- **Coaster name** with link → `<a href="/1657.htm">Alpen Blitz</a>` → `rcdb_id = 1657`
- **Park name** with link → `<a href="/4946.htm">Playcenter São Paulo</a>` → `rcdb_id = 4946`
- Status (Operating, Defunct, Relocated, etc.)

The page header indicates total and pagination:
```
Found: 212 (Page 1 of 9)
```

### Park Page (`/{park_id}.htm`)

Contains:
- **Park name** → `<h1>Cedar Point</h1>`
- **Location** → links to city, state/region, country (via `location.htm?id=...`)
- **Latitude and longitude** → embedded in Google Maps URLs in the page body:
  ```
  https://www.google.com/maps/place/41.481972,-82.684563/@41.481972,-82.684563,...
  ```
  Extraction regex: `maps\.google\.com/maps/place/(-?\d+\.\d+),(-?\d+\.\d+)`
- **Coaster list** — "Operating Roller Coasters" and "Defunct Roller Coasters" tables with links to each coaster

### Coaster Page (`/{coaster_id}.htm`)

Contains:
- **Coaster name** → `<h1>Raptor</h1>`
- **Link to park** → `<a href="/4529.htm">Cedar Point</a>`
- **Own lat/lng** (location of the attraction within the park) → same Google Maps pattern
- Technical data (height, speed, length — **out of MVP scope**)

---

## n8n Workflow

### Overview

```
Schedule Trigger
    ↓
For each target country (Brazil + others in the future):
    ↓
Fetch listing page (page 1) → extract total pages
    ↓
Loop through all pages → collect pairs (coaster_rcdb_id, park_rcdb_id, coaster_name)
    ↓
Deduplicate unique park_rcdb_ids
    ↓
For each unique park_id → fetch park page → extract name, city, country, lat, lng
    ↓
Upsert parks into PostgreSQL (conflict on rcdb_id)
    ↓
Upsert coasters into PostgreSQL (conflict on rcdb_id)
```

---

## Workflow Nodes (detailed configuration)

### Node 1: Schedule Trigger

- **Type:** Schedule Trigger
- **Configuration:** Cron `0 3 * * *` (every day at 03:00 UTC)
- For manual initial load: run via "Execute workflow" in the panel

---

### Node 2: Set — Define target countries

- **Type:** Set
- **Output:** `countries` array with location_ids to process

```json
{
  "countries": [
    { "name": "Brazil", "location_id": "26724" }
  ]
}
```

> For future global expansion: add more entries to the array.

---

### Node 3: Split In Batches — iterate by country

- **Type:** SplitInBatches
- Processes one country at a time

---

### Node 4: HTTP Request — Fetch listing page 1

- **Type:** HTTP Request
- **URL:** `https://rcdb.com/r.htm?ot=2&ol={{ $json.location_id }}&page=1`
- **Method:** GET
- **Response:** Full HTML

---

### Node 5: HTML Extract — Extract total pages

- **Type:** HTML Extract
- **CSS selector:** `#report p` (or the element containing "Found: X (Page 1 of Y)")
- **Regex on extracted text:** `Page 1 of (\d+)` → capture total page count

Alternatively, extract the last page link from the paginator:
- Selector: `a[href*="page="]` (last pagination link)
- Extract maximum `page=` number from hrefs

---

### Node 6: Code — Generate URL array for all pages

- **Type:** Code (JavaScript)

```javascript
const totalPages = parseInt($input.first().json.totalPages);
const locationId = $input.first().json.location_id;

const urls = [];
for (let page = 1; page <= totalPages; page++) {
  urls.push({
    url: `https://rcdb.com/r.htm?ot=2&ol=${locationId}&page=${page}`,
    page: page,
    location_id: locationId
  });
}

return urls.map(u => ({ json: u }));
```

---

### Node 7: HTTP Request — Fetch each listing page (with throttle)

- **Type:** HTTP Request
- **URL:** `{{ $json.url }}`
- **Rate limiting:** add a **Wait** node of 1–2 seconds between calls to avoid overloading RCDB
- **On Error:** Continue (log and move to next page)

---

### Node 8: HTML Extract — Extract coasters and parks from listing

- **Type:** HTML Extract
- **Extract each row** from the results table:

For each `<tr>` in the results table:
- **Coaster name:** `td:nth-child(2) a` → `.text()`
- **Coaster rcdb_id:** `td:nth-child(2) a` → `href` attribute → regex `/(\d+)\.htm/` → group 1
- **Park name:** `td:nth-child(3) a` → `.text()`
- **Park rcdb_id:** `td:nth-child(3) a` → `href` attribute → regex `/(\d+)\.htm/` → group 1

> **Note:** `ot=2` includes all coasters (operating + defunct). To filter only operating, add `&ex` to the URL: `r.htm?ot=2&ol=26724&ex`. Recommended for MVP to reduce volume, adjustable later.

---

### Node 9: Code — Deduplicate unique park IDs

- **Type:** Code (JavaScript)

```javascript
const allItems = $input.all();

// Collect all coasters and unique parks from the listing
const coastersMap = {};
const parksMap = {};

for (const item of allItems) {
  const { coaster_rcdb_id, coaster_name, park_rcdb_id, park_name } = item.json;
  
  if (coaster_rcdb_id && coaster_name) {
    // Status not yet resolved here — will be filled after fetching park pages (Node 11b)
    coastersMap[coaster_rcdb_id] = { rcdb_id: coaster_rcdb_id, name: coaster_name, park_rcdb_id };
  }
  if (park_rcdb_id && park_name) {
    parksMap[park_rcdb_id] = { rcdb_id: park_rcdb_id, name: park_name };
  }
}

// Output 0: list of unique park_ids for fetching park pages
// Coasters will have status resolved in Node 11b, after parks are processed
return [
  Object.values(parksMap).map(p => ({ json: p })),
];
```

---

### Node 10: HTTP Request — Fetch each park page

- **Type:** HTTP Request
- **URL:** `https://rcdb.com/{{ $json.rcdb_id }}.htm`
- **Rate limiting:** Wait 1–2 seconds between calls
- **On Error:** Continue (log error, move to next park)

---

### Node 11: HTML Extract + Code — Extract park data

- **Type:** Code (JavaScript) — process the returned HTML

```javascript
const html = $input.first().json.data; // HTML from park page
const rcdb_id = $input.first().json.rcdb_id;

// Extract name (h1)
const nameMatch = html.match(/<h1>([^<]+)<\/h1>/);
const name = nameMatch ? nameMatch[1].trim() : null;

// Extract lat/lng from Google Maps link
// Pattern: maps.google.com/maps/place/{lat},{lng}/@{lat},{lng}
const coordMatch = html.match(/maps\.google\.com\/maps\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
const latitude = coordMatch ? parseFloat(coordMatch[1]) : null;
const longitude = coordMatch ? parseFloat(coordMatch[2]) : null;

// Extract location (city, state/region, country)
// Location links follow the pattern /location.htm?id=...
// Location breadcrumb text: "City, State, Country"
const locationMatch = html.match(/location\.htm\?id=\d+">([^<]+)<\/a>,\s*<a[^>]*location\.htm\?id=\d+">([^<]+)<\/a>,\s*<a[^>]*location\.htm\?id=\d+">([^<]+)<\/a>/);
let city = null, country = null;
if (locationMatch) {
  city = locationMatch[1].trim();
  // locationMatch[2] is state/region (ignored for MVP)
  country = locationMatch[3].trim();
}

// Fallback: for parks with only city and country (no state)
if (!city) {
  const simpleMatch = html.match(/location\.htm\?id=\d+">([^<]+)<\/a>,\s*<a[^>]*location\.htm\?id=\d+">([^<]+)<\/a>/);
  if (simpleMatch) {
    city = simpleMatch[1].trim();
    country = simpleMatch[2].trim();
  }
}

// Extract official park status
// RCDB displays status just below the name and location via g.htm?id= link
// Rule: take the FIRST g.htm?id= that appears in the HTML.
// That is always the current park status — any later occurrences
// (defunct coasters, SBNO history) are automatically ignored.
//
// Confirmed IDs from inspecting real RCDB pages:
//   id=93  → Operating          (e.g. rcdb.com/4546.htm)
//   id=310 → Under Construction (e.g. rcdb.com/22331.htm)
//   id=311 → SBNO               (e.g. rcdb.com/10339.htm)
//   id=318 → Operated/Defunct   (e.g. rcdb.com/4946.htm)
const STATUS_MAP = {
  '93':  'operating',
  '310': 'under_construction',
  '311': 'sbno',      // Standing But Not Operating — extended maintenance, may return
  '318': 'defunct',   // Operated = permanently closed park
};
const firstStatusMatch = html.match(/g\.htm\?id=(\d+)/);
const park_status = firstStatusMatch
  ? (STATUS_MAP[firstStatusMatch[1]] ?? 'operating')
  : 'operating';

// Extract each coaster's status from park page sections.
// Real RCDB HTML uses <h4> (not markdown ####), structured as:
//   <h4>Defunct Roller Coasters: <a href="...">4</a></h4>
//   followed by a table with links <a href=/511.htm>Name</a>
//
// Possible sections:
//   "Operating Roller Coasters"          → 'operating'
//   "SBNO Roller Coasters"               → 'sbno'
//   "Defunct Roller Coasters"            → 'defunct'
//   "Roller Coasters Under Construction" → 'under_construction'
//
// Strategy: find each <h4> with "Roller Coasters", record its status,
// then collect all href=/{id}.htm links until the next <h4>, </section> or <h3>.
const SECTION_STATUS_MAP = {
  'operating roller coasters':          'operating',
  'sbno roller coasters':               'sbno',
  'defunct roller coasters':            'defunct',
  'roller coasters under construction': 'under_construction',
};

const coasterStatusMap = {};
const sectionRegex = /<h4>([^<]*Roller Coasters[^<]*):.*?<\/h4>([\s\S]*?)(?=<h4>|<\/section>|<h3>|$)/gi;
const coasterLinkRegex = /href=\/?(\d+)\.htm/g;

let sectionMatch;
while ((sectionMatch = sectionRegex.exec(html)) !== null) {
  const headingKey = sectionMatch[1].trim().toLowerCase();
  const sectionStatus = SECTION_STATUS_MAP[headingKey] ?? 'operating';
  const sectionBody = sectionMatch[2];

  coasterLinkRegex.lastIndex = 0;
  let linkMatch;
  while ((linkMatch = coasterLinkRegex.exec(sectionBody)) !== null) {
    coasterStatusMap[linkMatch[1]] = sectionStatus;
  }
}

return [{
  json: {
    rcdb_id,
    name,
    latitude,
    longitude,
    city,
    country,
    status: park_status,
    coasterStatusMap,   // { "291": "operating", "292": "sbno", "293": "defunct", ... }
    synced_at: new Date().toISOString()
  }
}];
```

---

### Node 11b: Code — Resolve coaster status via coasterStatusMap

After all parks are fetched and processed by Node 11, consolidate the `coasterStatusMap` from each park and resolve the status of each coaster collected in Node 9.

- **Type:** Code (JavaScript)

```javascript
const allParkItems = $input.all();

// Consolidate all coasterStatusMaps into a single global lookup
// { "291": "operating", "292": "sbno", "293": "defunct", ... }
const globalCoasterStatusMap = {};
for (const item of allParkItems) {
  const map = item.json.coasterStatusMap ?? {};
  Object.assign(globalCoasterStatusMap, map);
}

// Retrieve list of coasters collected in Node 9
// (passed via $node["Node 9 — Deduplicate park IDs"].json or equivalent)
const allCoasters = Object.values($node["Node 9 — Deduplicate park IDs"].json.coastersMap ?? {});

// Apply resolved status to each coaster; fallback: 'operating'
return allCoasters.map(c => ({
  json: {
    coaster_name:    c.name,
    coaster_rcdb_id: c.rcdb_id,
    park_rcdb_id:    c.park_rcdb_id,
    status:          globalCoasterStatusMap[String(c.rcdb_id)] ?? 'operating',
  }
}));
```

> **n8n implementation note:** accessing Node 9 via `$node[...]` requires the exact node name. Alternatively, use a flow variable (Set node) to store `coastersMap` before the park split, and retrieve it here.

---

### Node 12: PostgreSQL — Upsert parks

- **Type:** Postgres
- **Operation:** Execute Query

```sql
INSERT INTO parks (id, name, city, country, latitude, longitude, rcdb_id, status, synced_at)
VALUES (
  gen_random_uuid(),
  $1, $2, $3, $4, $5, $6, $7, NOW()
)
ON CONFLICT (rcdb_id) DO UPDATE SET
  name       = EXCLUDED.name,
  city       = EXCLUDED.city,
  country    = EXCLUDED.country,
  latitude   = EXCLUDED.latitude,
  longitude  = EXCLUDED.longitude,
  status     = EXCLUDED.status,
  synced_at  = NOW()
WHERE
  parks.name      IS DISTINCT FROM EXCLUDED.name       OR
  parks.city      IS DISTINCT FROM EXCLUDED.city       OR
  parks.country   IS DISTINCT FROM EXCLUDED.country    OR
  parks.latitude  IS DISTINCT FROM EXCLUDED.latitude   OR
  parks.longitude IS DISTINCT FROM EXCLUDED.longitude  OR
  parks.status    IS DISTINCT FROM EXCLUDED.status;
```

**Parameters:**
- `$1` → `{{ $json.name }}`
- `$2` → `{{ $json.city }}`
- `$3` → `{{ $json.country }}`
- `$4` → `{{ $json.latitude }}`
- `$5` → `{{ $json.longitude }}`
- `$6` → `{{ $json.rcdb_id }}`
- `$7` → `{{ $json.status }}`

---

### Node 13: PostgreSQL — Upsert coasters

After all parks have been inserted/updated and coaster statuses resolved (Node 11b), upsert coasters resolving `park_id` from `park_rcdb_id`:

```sql
INSERT INTO coasters (id, name, park_id, rcdb_id, status, synced_at)
SELECT
  gen_random_uuid(),
  $1,
  p.id,
  $2,
  $3,
  NOW()
FROM parks p
WHERE p.rcdb_id = $4
ON CONFLICT (rcdb_id) DO UPDATE SET
  name      = EXCLUDED.name,
  park_id   = EXCLUDED.park_id,
  status    = EXCLUDED.status,
  synced_at = NOW()
WHERE
  coasters.name    IS DISTINCT FROM EXCLUDED.name    OR
  coasters.park_id IS DISTINCT FROM EXCLUDED.park_id OR
  coasters.status  IS DISTINCT FROM EXCLUDED.status;
```

**Parameters:**
- `$1` → `{{ $json.coaster_name }}`
- `$2` → `{{ $json.coaster_rcdb_id }}`
- `$3` → `{{ $json.status }}`
- `$4` → `{{ $json.park_rcdb_id }}`

---

### Node 14: Error Handler — Error logging

- Each HTTP Request block must have an error path that:
  1. Logs the `rcdb_id` that failed and the error message
  2. Continues the flow without interrupting the entire workflow
- Use a **Set** node to structure the log and **Postgres** (a `scraper_errors` table) or simply `console.log` via a **Code** node

---

## Request Volume per Execution

| Scope | Listing requests | Park page requests | Estimated total |
|-------|-----------------|-------------------|-----------------|
| Brazil only | ~9 | ~50 unique parks | ~60 |
| Global (operating) | ~276 | ~4,673 parks | ~4,950 |
| Global (all) | ~551 | ~6,504 parks | ~7,055 |

> For the initial load, run the workflow manually with global scope. For daily updates, volume is low because the upsert only updates when there's a real difference.

---

## Rate Limiting Recommendations

- **Between listing pages:** 500ms delay
- **Between park page fetches:** 1–2 seconds delay
- **Timeout per request:** 10 seconds
- **Automatic retries:** 2 attempts with exponential backoff (n8n handles this natively)
- Avoid high parallelism — run sequentially or with max concurrency of 2

---

## Post-Execution Validation

After the initial load, run the following validation queries in PostgreSQL:

```sql
-- General counts
SELECT COUNT(*) FROM parks;    -- Expected: ~50 (Brazil) or ~4,673 (global)
SELECT COUNT(*) FROM coasters; -- Expected: ~212 (Brazil) or ~6,839 (global operating)

-- Check parks without lat/lng (extraction failed)
SELECT id, name, rcdb_id FROM parks WHERE latitude IS NULL OR longitude IS NULL;

-- Check coasters without resolved park_id
SELECT id, name, rcdb_id FROM coasters WHERE park_id IS NULL;

-- Data sample
SELECT p.name, p.city, p.country, p.latitude, p.longitude, COUNT(c.id) AS coasters
FROM parks p
LEFT JOIN coasters c ON c.park_id = p.id
GROUP BY p.id
ORDER BY coasters DESC
LIMIT 20;
```

---

## Out of Scope for This Workflow

- Coaster technical data (height, speed, length) — only collected in a future phase if decided
- Individual coaster lat/lng (parent park lat/lng is used for proximity)
- Coasters with "Relocated" status — included in upsert but no special handling
- Images or videos from RCDB
