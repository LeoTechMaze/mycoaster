# MyCoaster — Plano de Implementação

**Data:** 2026-05-15  
**Status:** Aprovado

Tasks granulares estão no **ClickUp** → Board "🎢 HapFun — Produto".

---

## Fases

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

---

## Paralelismo entre fases

- Fase 0 roda em paralelo com todo o desenvolvimento
- O backend da Fase 4 (IA) pode ser preparado durante a Fase 3, mas só é ativado com dados suficientes
- Negociação comercial para cupons (Fase 5) pode começar durante a Fase 2 ou 3

---

## Prioridades

| Fase | Prioridade | Dependências |
|---|---|---|
| 0 — Fundação | P0 | — |
| 1 — MVP de lançamento | P0 | Fase 0 |
| 2 — Competição e retenção | P1 | Fase 1 |
| 3 — Conteúdo da comunidade | P2 | Fases 1 e 2 |
| 4 — Inteligência (IA) | P2 | Fase 3 (reviews acumuladas) |
| 5 — Monetização | P3 | Fases 1–4 (retenção comprovada) |

---

## Stack de ferramentas

| Categoria | Ferramenta |
|---|---|
| Backend framework | Node.js + Express |
| Query builder | knex.js |
| Auth SDK | firebase-admin |
| Cache | ioredis |
| App navigation | React Navigation |
| Auth mobile | @react-native-firebase/auth |
| HTTP client | axios |
| Share | react-native-share |
| Scraper | n8n (self-hosted) |
| Local DB dev | Docker Compose |
| Object storage | S3 ou Cloudflare R2 (a definir) |
