# Coaster Tracker — Design Spec v2

**Data:** 2026-05-14  
**Status:** Aprovado
**Changelog:** Incorpora decisões sobre rede social, galeria comunitária, IA de reviews e fases de implementação.

---

## Visão geral

App mobile e rede social para entusiastas de parques de diversão e montanhas-russas. Permite descobrir parques e coasters próximos (ou em qualquer lugar do mundo), marcar os coasters já andados acumulando créditos, avaliar parques e coasters com reviews e notas, explorar galeria de fotos e vídeos da comunidade, competir num leaderboard global, e conectar-se com outros parqueiros.

**Posicionamento:** A casa digital do parqueiro — tracking, reviews estruturadas, galeria comunitária e conexão entre entusiastas e criadores de conteúdo do nicho.

**Plataformas:** iOS e Android  
**Stack:** React Native (sem Expo) · Node.js + Express · PostgreSQL · Redis · Firebase Auth · n8n

---

## Público-alvo

Entusiastas de montanhas-russas e parques de diversão que querem rastrear coasters andados, avaliar experiências, compartilhar conteúdo visual, planejar visitas a novos parques e comparar seu progresso com outros parqueiros. Foco inicial no mercado brasileiro, com expansão internacional como horizonte futuro.

---

## Arquitetura

### Componentes

| Componente             | Tecnologia                        | Responsabilidade                                |
| ---------------------- | --------------------------------- | ----------------------------------------------- |
| App móvel              | React Native                      | UI, GPS, navegação, câmera, share               |
| API Server             | Node.js + Express                 | Lógica de negócio, endpoints REST               |
| Banco de dados         | PostgreSQL                        | Persistência principal                          |
| Cache                  | Redis                             | Leaderboard global, dados frequentemente lidos  |
| Auth provider          | Firebase Auth                     | OAuth Google/Apple + email/senha                |
| Scraper                | n8n                               | Sincronização periódica de dados do RCDB        |
| Armazenamento de mídia | A definir (ex: S3, Cloudflare R2) | Fotos da comunidade                             |
| IA (batch)             | API LLM (ex: Claude/GPT)          | Resumos de reviews e extração de tags temáticas |

### Fluxo principal

1. App autentica via Firebase Auth → recebe JWT
2. JWT é validado pelo backend em cada request
3. App consome API REST para parques, coasters, créditos, reviews, galeria e leaderboard
4. Workflow n8n roda periodicamente, faz scraping do RCDB e atualiza dados no PostgreSQL via upsert
5. Leaderboard é cacheado no Redis e invalidado quando um usuário ganha crédito
6. Batch job de IA roda periodicamente, processa reviews e gera resumos + tags temáticas cacheados no banco

---

## Modelo de dados

### Tabelas

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

### Trigger de crédito

Ao inserir em `user_credits` → incrementa `users.credit_count` e atualiza `badge_level` se atingir threshold.  
Ao deletar de `user_credits` → decrementa `users.credit_count` e atualiza `badge_level` se necessário.

### Thresholds de badges

| Badge      | Créditos |
| ---------- | -------- |
| rookie     | 0–49     |
| enthusiast | 50–149   |
| veteran    | 150–299  |
| legend     | 300+     |

_Valores iniciais — podem ser ajustados com base nos dados reais de uso._

---

## API Endpoints (REST)

### Auth

| Método | Rota        | Descrição                                   |
| ------ | ----------- | ------------------------------------------- |
| POST   | /auth/login | Valida token Firebase, cria/retorna usuário |

### Usuários

| Método | Rota       | Descrição                                                     |
| ------ | ---------- | ------------------------------------------------------------- |
| GET    | /users/:id | Perfil público (nome, avatar, badge, créditos, redes sociais) |
| PATCH  | /users/me  | Atualizar perfil (nome, avatar, redes sociais)                |

### Parques

| Método | Rota                     | Descrição                                         |
| ------ | ------------------------ | ------------------------------------------------- |
| GET    | /parks?lat=&lng=&radius= | Parques próximos por GPS                          |
| GET    | /parks?country=&city=    | Busca por cidade/país                             |
| GET    | /parks/:id               | Detalhe do parque (dados, ai_summary, nota média) |
| GET    | /parks/:id/coasters      | Coasters de um parque                             |
| GET    | /parks/:id/reviews       | Reviews do parque                                 |
| GET    | /parks/:id/photos        | Galeria de fotos do parque                        |
| GET    | /parks/:id/videos        | Vídeos vinculados ao parque                       |

### Coasters

| Método | Rota                        | Descrição                                             |
| ------ | --------------------------- | ----------------------------------------------------- |
| GET    | /coasters?lat=&lng=&radius= | Coasters próximos por GPS (via localização do parque) |
| GET    | /coasters?country=&city=    | Coasters por cidade/país                              |
| GET    | /coasters/:id               | Detalhe do coaster (dados, ai_summary, nota média)    |
| GET    | /coasters/:id/reviews       | Reviews do coaster                                    |
| GET    | /coasters/:id/photos        | Galeria de fotos do coaster                           |
| GET    | /coasters/:id/videos        | Vídeos vinculados ao coaster                          |

### Créditos

| Método | Rota                 | Descrição                                    |
| ------ | -------------------- | -------------------------------------------- |
| POST   | /credits             | Marcar coaster como andado                   |
| DELETE | /credits/:coaster_id | Desmarcar coaster                            |
| GET    | /credits/me          | Histórico de créditos do usuário autenticado |

### Reviews

| Método | Rota                 | Descrição                                                     |
| ------ | -------------------- | ------------------------------------------------------------- |
| POST   | /reviews             | Criar review (parque ou coaster): nota geral 1-5 + comentário |
| PUT    | /reviews/:id         | Atualizar review existente                                    |
| GET    | /reviews/coaster/:id | Reviews de um coaster                                         |
| GET    | /reviews/park/:id    | Reviews de um parque                                          |

### Fotos

| Método | Rota             | Descrição                                      |
| ------ | ---------------- | ---------------------------------------------- |
| POST   | /photos          | Upload de foto (vinculada a parque ou coaster) |
| POST   | /photos/:id/like | Curtir foto                                    |
| DELETE | /photos/:id/like | Descurtir foto                                 |
| DELETE | /photos/:id      | Remover foto própria                           |

### Vídeos

| Método | Rota        | Descrição                                     |
| ------ | ----------- | --------------------------------------------- |
| POST   | /videos     | Vincular vídeo do YouTube a parque ou coaster |
| DELETE | /videos/:id | Remover vínculo de vídeo próprio              |

### Leaderboard

| Método | Rota         | Descrição                                   |
| ------ | ------------ | ------------------------------------------- |
| GET    | /leaderboard | Top usuários por credit count (Redis cache) |

---

## RCDB Scraper (n8n)

### Estratégia

- Workflow no n8n agendado via trigger de tempo (1x por dia, madrugada)
- Faz scraping do rcdb.com e busca lista de parques + coasters por parque
- Dados coletados: nome do parque, cidade, país, lat/lng, lista de coasters (apenas nome)
- Upsert no PostgreSQL usando `rcdb_id` como chave — nunca duplica
- n8n gerencia retries e logs de erro nativamente

### Campos coletados

- Park: `name`, `country`, `city`, `latitude`, `longitude`, `rcdb_id`
- Coaster: `name`, `park_id`, `rcdb_id`

---

## IA — Resumos e tags temáticas

### Visão geral

Um batch job periódico processa reviews em texto livre e gera dois outputs para cada parque e coaster: um resumo textual e um conjunto de tags temáticas com contagem de menções e sentimento (positivo/negativo/misto).

### Regras

- Só é gerado quando há no mínimo 10 reviews para o parque ou coaster
- Roda periodicamente (ex: semanal) ou quando acumular N reviews novas desde a última geração
- Output salvo como JSONB no campo `ai_summary` do parque ou coaster
- App lê o JSON cacheado — sem chamada de IA em tempo real

### Formato do ai_summary (JSONB)

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

### Tags esperadas (não fixas — emergem dos comentários)

**Para parques:** Tematização, Filas, Alimentação, Atendimento, Infraestrutura, Custo-benefício, Limpeza, Estacionamento, etc.  
**Para coasters:** Adrenalina, Suavidade, Brusquidão, Tematização, Fila, Conforto, Emoção, Enjoo, etc.

### UI

- Resumo exibido no topo da seção de reviews do parque/coaster
- Tags clicáveis abaixo do resumo — ao clicar, filtra reviews que mencionam o tema
- Label "Gerado por IA a partir dos comentários da comunidade" visível

---

## Galeria de fotos

### Regras de upload

- Cada usuário pode enviar até 3 fotos por parque e 3 por coaster, por período (ex: por mês)
- Usuários premium podem enviar até 6 fotos por parque/coaster por período
- Fotos entram com status `pending` e ficam visíveis após moderação (inicialmente: delay + report pela comunidade)
- Ao fazer upload, usuário concede licença de uso da imagem na galeria do app, com autoria creditada

### Ordenação do carrossel

Prioridade de exibição baseada em: likes (maior peso) + recência (fotos mais novas sobem) — carregamento paginado para limitar tráfego.

### Cold start

- Antes do lançamento da feature, galeria dos principais parques é populada com fotos do próprio time/criador
- Parques sem fotos exibem CTA: "Visitou esse parque? Seja o primeiro a compartilhar uma foto!"
- Campanha de lançamento nos canais do criador (YouTube/Instagram) para ativar a comunidade

---

## Vídeos

### Regras

- Apenas URLs do YouTube são aceitas (sem armazenamento de vídeo no servidor)
- Thumbnail e título extraídos automaticamente via YouTube oEmbed/API
- Vinculados a parque e/ou coaster
- Exibidos na seção de vídeos do perfil do parque ou coaster

---

## Sistema de reviews

### Fluxo do usuário

1. Usuário seleciona parque ou coaster
2. Dá uma nota geral de 1 a 5 estrelas
3. Escreve um comentário em texto livre (opcional, mas incentivado)
4. Submete — uma review por parque e uma por coaster por usuário

### Notas

- Nota média do parque/coaster é calculada democraticamente — todos os votos têm peso igual
- Badge do usuário (Novato, Entusiasta, Veterano, Lenda) é exibido ao lado do nome na review, permitindo que o leitor avalie o nível de experiência de quem escreveu
- Não há peso diferenciado para usuários pagantes ou com mais créditos

---

## Perfil do usuário

### Dados exibidos

- Nome, avatar, badge de nível
- Credit count e histórico de coasters andados
- Links para Instagram, TikTok e YouTube (opcionais)
- Fotos enviadas para a galeria
- Vídeos vinculados
- Reviews escritas

### Perfil público

Qualquer usuário pode visitar o perfil de outro e ver créditos, badge, redes sociais, fotos e vídeos compartilhados.

---

## Monetização (fase futura)

### Assinatura premium

- Limite maior de uploads de fotos por período
- Estatísticas avançadas do perfil (ex: distribuição de coasters por país, tipo, etc.)
- Perfil personalizado
- Sem ads

### Cupons geolocalizados

- Quando o usuário estiver na região de um parque parceiro, recebe sugestão de cupom de desconto
- Modelo de comissão sobre conversões
- Requer parcerias comerciais individuais com cada parque

### Afiliados de hospedagem

- Sugestão de hospedagens próximas a parques via programas de afiliados (ex: Booking, Hoteis.com)
- Comissão sobre reservas realizadas via link do app

---

## Fases de implementação

### Fase 0 — Fundação (paralela a todas as fases)

**Objetivo:** Infraestrutura base pronta e dados populados.

- Configuração do banco de dados PostgreSQL + Redis
- Servidor Node.js + Express com CI/CD
- Scraper n8n rodando e populando parques e coasters do RCDB
- Setup do ambiente de staging/produção

_O scraper deve estar rodando e com dados antes de qualquer tela do app ser testada._

### Fase 1 — MVP de lançamento

**Objetivo:** App funcional que já entrega valor e começa a acumular reviews.

- Autenticação (Firebase Auth — Google, Apple, email/senha)
- Descoberta de parques e coasters (GPS + busca por cidade/país)
- Listagem de coasters por parque
- Sistema de créditos (marcar/desmarcar coaster)
- Perfil do usuário com credit count e histórico
- Review simples: nota geral 1-5 + comentário em texto livre
- Reviews de parques e de coasters

### Fase 2 — Competição e retenção

**Objetivo:** Transformar o app de ferramenta individual em experiência social e competitiva.

- Leaderboard global (Redis cache)
- Badges visuais por nível de créditos (Novato, Entusiasta, Veterano, Lenda)
- Compartilhamento de conquistas (share sheet nativo)
- Perfil público com links para Instagram, TikTok e YouTube

### Fase 3 — Conteúdo da comunidade

**Objetivo:** Transformar as páginas de parques e coasters em espaços ricos com conteúdo visual.

**Pré-requisito:** Base de usuários ativa (Fases 1 e 2 consolidadas).

- Galeria de fotos por parque e coaster (upload com limite por período)
- Vídeos via URL do YouTube vinculados a parque/coaster
- Sistema de likes em fotos
- Carrossel com ordenação por likes + recência
- Pipeline básico de moderação (delay + report)
- Estratégia de cold start: seed content do criador + campanha de lançamento nos canais

### Fase 4 — Inteligência (IA)

**Objetivo:** Agregar valor sobre a massa de reviews acumulada.

**Pré-requisito:** Massa crítica de reviews (mínimo ~10 por parque/coaster para ativação).

- Resumo por IA das reviews (estilo Amazon "Customers say")
- Tags temáticas extraídas dos comentários com contagem e sentimento
- Tags clicáveis que filtram reviews por tema
- Batch job periódico com output cacheado em JSONB

### Fase 5 — Monetização

**Objetivo:** Gerar receita após retenção comprovada.

**Pré-requisito:** Engajamento e retenção validados nas fases anteriores.

- Assinatura premium (limite maior de uploads, stats avançados, perfil personalizado)
- Cupons geolocalizados com notificação por proximidade (requer parcerias com parques)
- Afiliados de hospedagem

### Paralelismo entre fases

- Fase 0 roda em paralelo com todo o desenvolvimento
- O backend da Fase 4 (IA) pode ser preparado durante a Fase 3, mas só é ativado com dados suficientes
- Negociação comercial para cupons (Fase 5) pode começar durante a Fase 2 ou 3

---

## Fora do escopo (todas as fases)

- Filtros por tipo, altura ou velocidade de coasters
- Dados técnicos dos coasters (apenas nome)
- Feed de atividade de amigos (timeline)
- Notificações push
- Modo offline
- Armazenamento de vídeos no servidor (apenas URLs do YouTube)
- Peso diferenciado nas avaliações para usuários pagantes ou com mais créditos
- Categorias fixas de avaliação (notas por subcategoria) — substituído por tags emergentes via IA

---

## Decisões técnicas

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

---

---

# Plano de Implementação

**Data:** 2026-05-15  
**Status:** Atualizado — alinhado com Design Spec v2

---

## Visão geral

O plano segue as 6 fases definidas no design spec (Fase 0–5). Cada fase entrega valor incremental e pode ser testada antes de avançar. A Fase 0 roda em paralelo com todo o desenvolvimento.

---

## Stack de ferramentas

| Categoria         | Ferramenta                      |
| ----------------- | ------------------------------- |
| Backend framework | Node.js + Express               |
| Query builder     | knex.js                         |
| Auth SDK          | firebase-admin                  |
| Cache             | ioredis                         |
| App navigation    | React Navigation                |
| Auth mobile       | @react-native-firebase/auth     |
| HTTP client       | axios                           |
| Share             | react-native-share              |
| Scraper           | n8n (self-hosted)               |
| Local DB dev      | Docker Compose                  |
| Object storage    | S3 ou Cloudflare R2 (a definir) |

---

## Fase 0 — Fundação

**Objetivo:** Ambiente de desenvolvimento rodando, banco configurado e dados do RCDB populados.

### 0.1 — Infraestrutura e banco de dados

- [ ] Configurar repositório monorepo (`/api`, `/app`, `/scraper`)
- [ ] Configurar Docker Compose com PostgreSQL e Redis
- [ ] Criar migrations do banco de dados
  - [ ] Tabela `users` (com `badge_level`, `avatar_url`, `instagram_url`, `tiktok_url`, `youtube_url`, `is_premium`)
  - [ ] Tabela `parks` (com `ai_summary` jsonb nullable)
  - [ ] Tabela `coasters` (com `ai_summary` jsonb nullable)
  - [ ] Tabela `user_credits`
  - [ ] Tabela `reviews` (com `target_type`, `park_id`, `coaster_id`, partial unique indexes)
  - [ ] Tabela `photos` (com `status`, `like_count`)
  - [ ] Tabela `photo_likes`
  - [ ] Tabela `videos` (com `youtube_url`, `thumbnail_url`, `title`)
- [ ] Criar trigger PostgreSQL para `credit_count` e `badge_level` (insert/delete em `user_credits`)
- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Configurar projeto Node.js + Express base (`/api`)
  - [ ] Estrutura de pastas (`routes`, `controllers`, `models`, `middlewares`)
  - [ ] Conexão com PostgreSQL (`knex`)
  - [ ] Conexão com Redis (`ioredis`)
- [ ] Setup de CI/CD
- [ ] Setup do ambiente de staging/produção

**Entregável:** Banco rodando localmente com todas as 8 tabelas, trigger e indexes funcionando.

### 0.2 — RCDB Scraper (n8n)

- [ ] Configurar instância n8n (self-hosted ou cloud)
- [ ] Criar workflow n8n
  - [ ] Trigger: agendamento diário (madrugada)
  - [ ] HTTP Request node: buscar lista de parques do rcdb.com
  - [ ] Code node: parsear HTML e extrair `name`, `country`, `city`, `latitude`, `longitude`, `rcdb_id`
  - [ ] Loop por parque: buscar coasters de cada parque
  - [ ] Code node: extrair `name` e `rcdb_id` de cada coaster
  - [ ] PostgreSQL node: upsert em `parks` usando `rcdb_id` como chave
  - [ ] PostgreSQL node: upsert em `coasters` usando `rcdb_id` como chave
  - [ ] Error handling: log de erros por parque, continuar mesmo se um falhar
- [ ] Executar workflow manualmente para carga inicial
- [ ] Validar dados no banco (contagem de parques e coasters)

**Entregável:** Banco populado com dados reais do RCDB. Sincronização automática diária funcionando.

---

## Fase 1 — MVP de lançamento

**Objetivo:** App funcional com auth, descoberta de parques/coasters, créditos e reviews.

### 1.1 — Autenticação

#### Backend

- [ ] Configurar projeto Firebase (Auth)
- [ ] Implementar `POST /auth/login`
  - [ ] Validar token Firebase via Firebase Admin SDK
  - [ ] Criar usuário no PostgreSQL se não existir (upsert por `firebase_uid`)
  - [ ] Preencher `badge_level` como `'rookie'` para novos usuários
  - [ ] Retornar JWT próprio assinado
- [ ] Implementar middleware de autenticação JWT para proteger rotas

#### App React Native

- [ ] Configurar projeto React Native (sem Expo)
  - [ ] Navegação base com React Navigation
  - [ ] Estrutura de pastas (`screens`, `components`, `services`, `store`)
- [ ] Instalar e configurar `@react-native-firebase/auth`
- [ ] Tela de login
  - [ ] Botão "Entrar com Google"
  - [ ] Botão "Entrar com Apple"
  - [ ] Formulário email/senha
- [ ] Armazenar JWT no SecureStorage
- [ ] Interceptor HTTP para incluir JWT em todas as requests

**Entregável:** Login funcional em iOS e Android. JWT salvo e enviado nas requests.

### 1.2 — Parques e coasters

#### Backend

- [ ] Implementar `GET /parks?lat=&lng=&radius=`
  - [ ] Query PostgreSQL com cálculo de distância via fórmula de Haversine
  - [ ] Retornar lista ordenada por distância
- [ ] Implementar `GET /parks?country=&city=`
  - [ ] Busca case-insensitive por país e/ou cidade
- [ ] Implementar `GET /parks/:id`
  - [ ] Retornar detalhes do parque (incluindo nota média calculada das reviews)
- [ ] Implementar `GET /parks/:id/coasters`
  - [ ] Retornar lista de coasters do parque
- [ ] Implementar `GET /coasters?lat=&lng=&radius=`
  - [ ] Query via join com `parks` usando Haversine
  - [ ] Retornar coasters ordenados por distância do parque
- [ ] Implementar `GET /coasters?country=&city=`
  - [ ] Busca via join com `parks`, case-insensitive
- [ ] Implementar `GET /coasters/:id`
  - [ ] Retornar detalhes do coaster (incluindo nota média)

#### App React Native

- [ ] Tela de descoberta de parques
  - [ ] Solicitar permissão de localização GPS
  - [ ] Listar parques próximos (usando lat/lng do dispositivo)
  - [ ] Campo de busca por cidade/país
- [ ] Tela de descoberta de coasters
  - [ ] Listar coasters próximos
  - [ ] Campo de busca por cidade/país
- [ ] Tela de detalhe do parque
  - [ ] Nome, cidade, país, nota média
  - [ ] Lista de coasters com indicador "andado / não andado"
- [ ] Tela de detalhe do coaster
  - [ ] Nome, parque, nota média

**Entregável:** Usuário encontra parques e coasters por GPS ou busca.

### 1.3 — Tracking de créditos

#### Backend

- [ ] Implementar `POST /credits`
  - [ ] Inserir `user_credit` (trigger incrementa `credit_count` e atualiza `badge_level`)
  - [ ] Invalidar cache do leaderboard no Redis
- [ ] Implementar `DELETE /credits/:coaster_id`
  - [ ] Deletar `user_credit` (trigger decrementa `credit_count` e atualiza `badge_level`)
  - [ ] Invalidar cache do leaderboard no Redis
- [ ] Implementar `GET /credits/me`
  - [ ] Retornar histórico com coaster, parque e data

#### App React Native

- [ ] Botão "Marcar como andado" / "Desmarcar" na tela do coaster
  - [ ] Feedback visual imediato (optimistic update)
  - [ ] Sincronização com backend
- [ ] Tela de perfil
  - [ ] Foto e nome do usuário
  - [ ] Credit count em destaque
  - [ ] Badge de nível
  - [ ] Lista do histórico pessoal de coasters andados

**Entregável:** Créditos funcionando. Credit count e badge atualizam no perfil.

### 1.4 — Reviews

#### Backend

- [ ] Implementar `POST /reviews`
  - [ ] Suportar `target_type: 'coaster'` e `target_type: 'park'`
  - [ ] Upsert — cria ou atualiza review do usuário para aquele coaster/parque
  - [ ] Preencher `park_id` automaticamente via `coaster.park_id` quando `target_type = 'coaster'`
- [ ] Implementar `PUT /reviews/:id`
  - [ ] Atualizar review existente (rating e/ou comentário)
- [ ] Implementar `GET /reviews/coaster/:id`
  - [ ] Retornar reviews com nome, avatar e badge do usuário
- [ ] Implementar `GET /reviews/park/:id`
  - [ ] Retornar reviews do parque com nome, avatar e badge do usuário

#### App React Native

- [ ] Seção de reviews na tela de detalhe do coaster
  - [ ] Nota média
  - [ ] Lista de reviews (nome, badge, estrelas, comentário)
  - [ ] Formulário para deixar avaliação (estrelas + comentário)
- [ ] Seção de reviews na tela de detalhe do parque
  - [ ] Mesma estrutura do coaster

**Entregável:** Reviews de parques e coasters operacionais.

---

## Fase 2 — Competição e retenção

**Objetivo:** Leaderboard, badges visuais, compartilhamento e perfil público.

### 2.1 — Leaderboard

#### Backend

- [ ] Implementar `GET /leaderboard`
  - [ ] Verificar cache Redis primeiro (TTL: 5 minutos)
  - [ ] Se miss: query PostgreSQL ordenada por `credit_count DESC`, salvar no Redis
  - [ ] Retornar top 100 usuários (nome, avatar, badge, credit count)
  - [ ] Incluir posição do usuário autenticado se não estiver no top 100

#### App React Native

- [ ] Tela de leaderboard
  - [ ] Lista ranqueada com posição, nome, avatar, badge e credit count
  - [ ] Posição do usuário logado destacada

**Entregável:** Leaderboard funcionando com cache Redis.

### 2.2 — Badges visuais e perfil público

#### Backend

- [ ] Implementar `GET /users/:id`
  - [ ] Retornar perfil público: nome, avatar, badge, credit count, redes sociais
- [ ] Implementar `PATCH /users/me`
  - [ ] Atualizar nome, avatar_url, instagram_url, tiktok_url, youtube_url

#### App React Native

- [ ] Badges visuais exibidos no perfil, leaderboard e reviews
  - [ ] Ícone/cor diferente para cada nível (rookie, enthusiast, veteran, legend)
- [ ] Tela de perfil público (visitar perfil de outro usuário)
  - [ ] Nome, avatar, badge, credit count, redes sociais
- [ ] Tela de edição de perfil
  - [ ] Campos para nome, avatar, Instagram, TikTok, YouTube
- [ ] Share sheet ao marcar coaster como andado
  - [ ] Mensagem: "Acabei de andar em [coaster] em [parque]! 🎢"
  - [ ] Usar `react-native-share`

**Entregável:** Perfil público com redes sociais. Badges visíveis. Compartilhamento operacional.

---

## Fase 3 — Conteúdo da comunidade

**Objetivo:** Galeria de fotos e vídeos por parque e coaster.

**Pré-requisito:** Base de usuários ativa (Fases 1 e 2 consolidadas).

### 3.1 — Galeria de fotos

#### Backend

- [ ] Configurar object storage (S3 ou Cloudflare R2)
- [ ] Implementar `POST /photos`
  - [ ] Upload de imagem para object storage
  - [ ] Criar registro com `status: 'pending'`
  - [ ] Validar limite de uploads por usuário/período (3 para free, 6 para premium)
- [ ] Implementar `GET /parks/:id/photos` e `GET /coasters/:id/photos`
  - [ ] Retornar fotos aprovadas, ordenadas por likes + recência
  - [ ] Paginação para limitar tráfego
- [ ] Implementar `POST /photos/:id/like` e `DELETE /photos/:id/like`
  - [ ] Inserir/deletar `photo_like`
  - [ ] Atualizar `like_count` desnormalizado na foto
- [ ] Implementar `DELETE /photos/:id`
  - [ ] Permitir apenas ao autor da foto
  - [ ] Remover arquivo do object storage
- [ ] Pipeline de moderação
  - [ ] Delay antes de aprovar (mudar status de `pending` para `approved`)
  - [ ] Endpoint de report para a comunidade (futuro)

#### App React Native

- [ ] Carrossel de fotos na tela de detalhe do parque e coaster
  - [ ] Ordenação por likes + recência
  - [ ] Carregamento paginado
- [ ] Botão de upload de foto
  - [ ] Acesso à câmera e galeria do dispositivo
  - [ ] Compressão antes do upload
- [ ] Botão de like em fotos
- [ ] CTA "Visitou esse parque? Seja o primeiro a compartilhar uma foto!" para parques sem fotos
- [ ] Seed content: popular galeria dos principais parques com fotos do criador antes do lançamento

**Entregável:** Galeria comunitária funcionando com upload, likes e moderação básica.

### 3.2 — Vídeos

#### Backend

- [ ] Implementar `POST /videos`
  - [ ] Validar URL do YouTube
  - [ ] Extrair thumbnail e título via YouTube oEmbed API
  - [ ] Criar registro vinculado a parque e/ou coaster
- [ ] Implementar `GET /parks/:id/videos` e `GET /coasters/:id/videos`
  - [ ] Retornar vídeos ordenados por recência
- [ ] Implementar `DELETE /videos/:id`
  - [ ] Permitir apenas ao autor

#### App React Native

- [ ] Seção de vídeos na tela de detalhe do parque e coaster
  - [ ] Thumbnail, título, link para YouTube
- [ ] Formulário para vincular vídeo (colar URL do YouTube)

**Entregável:** Vídeos do YouTube vinculados a parques e coasters.

---

## Fase 4 — Inteligência (IA)

**Objetivo:** Resumos e tags temáticas gerados por IA a partir das reviews.

**Pré-requisito:** Massa crítica de reviews (mínimo ~10 por parque/coaster).

### 4.1 — Batch job de IA

#### Backend

- [ ] Criar script/job para processar reviews
  - [ ] Selecionar parques e coasters com ≥10 reviews e sem `ai_summary` ou com `ai_summary` desatualizado
  - [ ] Montar prompt com todas as reviews em texto livre
  - [ ] Chamar API LLM (Claude ou GPT) pedindo resumo + tags temáticas com contagem e sentimento
  - [ ] Parsear resposta e salvar como JSONB no campo `ai_summary`
- [ ] Agendar execução periódica (semanal ou baseada em threshold de reviews novas)
- [ ] Logging de custos de tokens e erros

### 4.2 — UI de resumos e tags

#### App React Native

- [ ] Exibir resumo no topo da seção de reviews (quando disponível)
  - [ ] Texto do resumo
  - [ ] Label "Gerado por IA a partir dos comentários da comunidade"
- [ ] Tags clicáveis abaixo do resumo
  - [ ] Label, contagem de menções, indicador de sentimento (positivo/negativo/misto)
  - [ ] Ao clicar, filtrar reviews que mencionam o tema

**Entregável:** Resumos e tags visíveis para parques e coasters com reviews suficientes.

---

## Fase 5 — Monetização

**Objetivo:** Gerar receita após retenção comprovada.

**Pré-requisito:** Engajamento e retenção validados nas fases anteriores.

### 5.1 — Assinatura premium

#### Backend

- [ ] Implementar flag `is_premium` e lógica de verificação
- [ ] Integrar com plataforma de pagamento (a definir: RevenueCat, Stripe, etc.)
- [ ] Ajustar limites de upload de fotos para premium (6 vs 3)

#### App React Native

- [ ] Tela de assinatura com benefícios
- [ ] Desbloqueio de features premium (stats avançados, perfil personalizado, mais uploads)
- [ ] Gerenciamento de assinatura

### 5.2 — Cupons geolocalizados

#### Backend

- [ ] Modelo de dados para cupons (parque parceiro, desconto, validade, código)
- [ ] Endpoint para buscar cupons disponíveis por proximidade
- [ ] Tracking de conversões (uso do cupom)

#### App React Native

- [ ] Notificação contextual quando próximo a parque parceiro
- [ ] Tela de cupom com código e instruções de uso

### 5.3 — Afiliados de hospedagem

#### Backend

- [ ] Integração com API de afiliados (ex: Booking, Hoteis.com)
- [ ] Endpoint para buscar hospedagens próximas a um parque

#### App React Native

- [ ] Seção de hospedagens na tela do parque
- [ ] Links de afiliado com tracking

**Entregável:** Receita via premium, cupons e afiliados.

---

## Ordem de prioridade

| Fase                       | Prioridade | Dependências                    |
| -------------------------- | ---------- | ------------------------------- |
| 0 — Fundação               | P0         | —                               |
| 1 — MVP de lançamento      | P0         | Fase 0                          |
| 2 — Competição e retenção  | P1         | Fase 1                          |
| 3 — Conteúdo da comunidade | P2         | Fases 1 e 2                     |
| 4 — Inteligência (IA)      | P2         | Fase 3 (reviews acumuladas)     |
| 5 — Monetização            | P3         | Fases 1–4 (retenção comprovada) |

> A Fase 0 (infra + scraper) roda em paralelo com todo o desenvolvimento.  
> O backend da Fase 4 pode ser preparado durante a Fase 3.  
> Negociação comercial para cupons (Fase 5) pode começar durante a Fase 2 ou 3.
