# MyCoaster — API Endpoints (REST)

---

## Auth

| Method | Route        | Description                                      |
| ------ | ------------ | ------------------------------------------------ |
| POST   | /auth/login  | Validates Firebase token, creates/returns user   |

## Users

| Method | Route       | Description                                                      |
| ------ | ----------- | ---------------------------------------------------------------- |
| GET    | /users/:id  | Public profile (name, avatar, badge, credits, social links)      |
| PATCH  | /users/me   | Update own profile (name, avatar, social links)                  |

## Parks

| Method | Route                     | Description                                           |
| ------ | ------------------------- | ----------------------------------------------------- |
| GET    | /parks?lat=&lng=&radius=  | Nearby parks by GPS                                   |
| GET    | /parks?country=&city=     | Search by city/country                                |
| GET    | /parks/:id                | Park detail (data, ai_summary, avg rating)            |
| GET    | /parks/:id/coasters       | Coasters in a park                                    |
| GET    | /parks/:id/reviews        | Park reviews                                          |
| GET    | /parks/:id/photos         | Park photo gallery                                    |
| GET    | /parks/:id/videos         | Videos linked to a park                               |

## Coasters

| Method | Route                         | Description                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| GET    | /coasters?lat=&lng=&radius=   | Nearby coasters by GPS (via parent park location)            |
| GET    | /coasters?country=&city=      | Coasters by city/country                                     |
| GET    | /coasters/:id                 | Coaster detail (data, ai_summary, avg rating)                |
| GET    | /coasters/:id/reviews         | Coaster reviews                                              |
| GET    | /coasters/:id/photos          | Coaster photo gallery                                        |
| GET    | /coasters/:id/videos          | Videos linked to a coaster                                   |

## Credits

| Method | Route                  | Description                                        |
| ------ | ---------------------- | -------------------------------------------------- |
| POST   | /credits               | Mark coaster as ridden                             |
| DELETE | /credits/:coaster_id   | Unmark coaster as ridden                           |
| GET    | /credits/me            | Authenticated user's credit history                |

## Reviews

| Method | Route                  | Description                                                       |
| ------ | ---------------------- | ----------------------------------------------------------------- |
| POST   | /reviews               | Create review (park or coaster): overall rating 1–5 + comment    |
| PUT    | /reviews/:id           | Update existing review                                            |
| GET    | /reviews/coaster/:id   | Reviews for a coaster                                             |
| GET    | /reviews/park/:id      | Reviews for a park                                                |

## Photos

| Method | Route              | Description                                         |
| ------ | ------------------ | --------------------------------------------------- |
| POST   | /photos            | Upload photo (linked to a park or coaster)          |
| POST   | /photos/:id/like   | Like a photo                                        |
| DELETE | /photos/:id/like   | Unlike a photo                                      |
| DELETE | /photos/:id        | Delete own photo                                    |

## Videos

| Method | Route        | Description                                         |
| ------ | ------------ | --------------------------------------------------- |
| POST   | /videos      | Link a YouTube video to a park or coaster           |
| DELETE | /videos/:id  | Remove own video link                               |

## Leaderboard

| Method | Route         | Description                                      |
| ------ | ------------- | ------------------------------------------------ |
| GET    | /leaderboard  | Top users by credit count (Redis cached)         |
