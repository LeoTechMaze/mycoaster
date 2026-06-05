# MyCoaster — Technical Decisions

---

| Decision                       | Choice                    | Reason                                                                                         |
| ------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------- |
| Auth                           | Firebase Auth             | OAuth ready for Google/Apple without server-side OAuth implementation                          |
| Ranking cache                  | Redis                     | Global leaderboard is read frequently — avoids full table scan                                 |
| Denormalized credit_count      | Yes (trigger)             | Performance: O(1) reads on profile and leaderboard                                             |
| RCDB scraping                  | n8n workflow              | Scheduled scraping with native retries and logs; upsert via `rcdb_id`                          |
| Proximity filtering            | lat/lng in PostgreSQL     | No Google Maps API dependency — distance calculated via query                                  |
| React Native without Expo      | Yes                       | Full control over native modules                                                               |
| Videos                         | YouTube URLs only         | Zero storage cost; thumbnail via API; traffic directed to creator                              |
| Community photos               | Upload with moderation    | Per-user/period limit; seed content for cold start; likes + recency for sorting                |
| Reviews                        | Overall rating + freetext | Low friction; subcategory ratings replaced by AI-emergent tags                                 |
| Review weight                  | Equal for all users       | Preserves credibility; badges give context without distorting average rating                   |
| Summaries and tags             | AI batch, JSONB cached    | Periodic processing avoids real-time token cost; minimum threshold of 10 reviews               |
| Photo storage                  | Object storage (S3/R2)    | Scalable, controlled cost with per-user upload limits                                          |
| Badges in DB                   | English strings           | i18n-ready; translated to PT-BR and other languages via app                                    |
| Coaster and park status        | 4 values: `operating`, `sbno`, `under_construction`, `defunct` | `sbno` (Standing But Not Operating) is distinct from `defunct` — SBNO = temporarily closed, may return; defunct = permanently closed. Source: RCDB g.htm?id= (parks) and `<h4>` section headings on park page (coasters). |
