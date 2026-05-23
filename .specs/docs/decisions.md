# MyCoaster — Decisões Técnicas

---

| Decisão                     | Escolha                  | Motivo                                                                                      |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| Auth                        | Firebase Auth            | OAuth pronto para Google/Apple sem implementar server-side OAuth                            |
| Cache de ranking            | Redis                    | Leaderboard global é lido com frequência — evita full table scan                            |
| credit_count desnormalizado | Sim (trigger)            | Performance: leitura O(1) no perfil e leaderboard                                           |
| RCDB scraping               | n8n workflow             | Scraping agendado com retries e logs nativos; upsert via `rcdb_id`                          |
| Filtro por proximidade      | lat/lng no PostgreSQL    | Sem necessidade de Google Maps API — distância calculada via query                          |
| React Native sem Expo       | Sim                      | Controle total sobre módulos nativos                                                        |
| Vídeos                      | Apenas YouTube URLs      | Custo zero de armazenamento; thumbnail via API; tráfego direcionado ao criador              |
| Fotos da comunidade         | Upload com moderação     | Limite por usuário/período; seed content para cold start; likes + recência para ordenação   |
| Reviews                     | Nota geral + texto livre | Baixa fricção; notas por categoria substituídas por tags emergentes via IA                  |
| Peso nas avaliações         | Igual para todos         | Preserva credibilidade; badges visuais dão contexto sem distorcer nota média                |
| Resumos e tags              | IA batch, JSONB cacheado | Processamento periódico evita custo de tokens em tempo real; threshold mínimo de 10 reviews |
| Armazenamento de fotos      | Object storage (S3/R2)   | Escalável, custo controlado com limite de uploads por usuário                               |
| Badges no banco             | Strings em inglês        | Preparado para i18n; tradução para PT-BR e outros idiomas via app                           |
| Status de coasters e parques | 4 valores: `operating`, `sbno`, `under_construction`, `defunct` | `sbno` (Standing But Not Operating) é distinto de `defunct` — SBNO = fechado temporariamente, pode retornar; defunct = encerrado permanentemente. Fonte: RCDB g.htm?id= (parques) e seções `<h4>` da página do parque (coasters). |
