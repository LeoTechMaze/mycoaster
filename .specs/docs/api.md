# MyCoaster — API Endpoints (REST)

---

## Auth

| Método | Rota        | Descrição                                   |
| ------ | ----------- | ------------------------------------------- |
| POST   | /auth/login | Valida token Firebase, cria/retorna usuário |

## Usuários

| Método | Rota       | Descrição                                                     |
| ------ | ---------- | ------------------------------------------------------------- |
| GET    | /users/:id | Perfil público (nome, avatar, badge, créditos, redes sociais) |
| PATCH  | /users/me  | Atualizar perfil (nome, avatar, redes sociais)                |

## Parques

| Método | Rota                     | Descrição                                         |
| ------ | ------------------------ | ------------------------------------------------- |
| GET    | /parks?lat=&lng=&radius= | Parques próximos por GPS                          |
| GET    | /parks?country=&city=    | Busca por cidade/país                             |
| GET    | /parks/:id               | Detalhe do parque (dados, ai_summary, nota média) |
| GET    | /parks/:id/coasters      | Coasters de um parque                             |
| GET    | /parks/:id/reviews       | Reviews do parque                                 |
| GET    | /parks/:id/photos        | Galeria de fotos do parque                        |
| GET    | /parks/:id/videos        | Vídeos vinculados ao parque                       |

## Coasters

| Método | Rota                        | Descrição                                             |
| ------ | --------------------------- | ----------------------------------------------------- |
| GET    | /coasters?lat=&lng=&radius= | Coasters próximos por GPS (via localização do parque) |
| GET    | /coasters?country=&city=    | Coasters por cidade/país                              |
| GET    | /coasters/:id               | Detalhe do coaster (dados, ai_summary, nota média)    |
| GET    | /coasters/:id/reviews       | Reviews do coaster                                    |
| GET    | /coasters/:id/photos        | Galeria de fotos do coaster                           |
| GET    | /coasters/:id/videos        | Vídeos vinculados ao coaster                          |

## Créditos

| Método | Rota                 | Descrição                                    |
| ------ | -------------------- | -------------------------------------------- |
| POST   | /credits             | Marcar coaster como andado                   |
| DELETE | /credits/:coaster_id | Desmarcar coaster                            |
| GET    | /credits/me          | Histórico de créditos do usuário autenticado |

## Reviews

| Método | Rota                 | Descrição                                                     |
| ------ | -------------------- | ------------------------------------------------------------- |
| POST   | /reviews             | Criar review (parque ou coaster): nota geral 1-5 + comentário |
| PUT    | /reviews/:id         | Atualizar review existente                                    |
| GET    | /reviews/coaster/:id | Reviews de um coaster                                         |
| GET    | /reviews/park/:id    | Reviews de um parque                                          |

## Fotos

| Método | Rota             | Descrição                                      |
| ------ | ---------------- | ---------------------------------------------- |
| POST   | /photos          | Upload de foto (vinculada a parque ou coaster) |
| POST   | /photos/:id/like | Curtir foto                                    |
| DELETE | /photos/:id/like | Descurtir foto                                 |
| DELETE | /photos/:id      | Remover foto própria                           |

## Vídeos

| Método | Rota        | Descrição                                     |
| ------ | ----------- | --------------------------------------------- |
| POST   | /videos     | Vincular vídeo do YouTube a parque ou coaster |
| DELETE | /videos/:id | Remover vínculo de vídeo próprio              |

## Leaderboard

| Método | Rota         | Descrição                                   |
| ------ | ------------ | ------------------------------------------- |
| GET    | /leaderboard | Top usuários por credit count (Redis cache) |
