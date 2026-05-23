# MyCoaster — Design Spec v2

**Data:** 2026-05-14  
**Status:** Aprovado

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

## RCDB Scraper (n8n)

### Estratégia

- Workflow no n8n agendado via trigger de tempo (1x por dia, madrugada)
- Faz scraping do rcdb.com e busca lista de parques + coasters por parque
- Dados coletados: nome do parque, cidade, país, lat/lng, lista de coasters (apenas nome)
- Upsert no PostgreSQL usando `rcdb_id` como chave — nunca duplica
- n8n gerencia retries e logs de erro nativamente

### Campos coletados

- Park: `name`, `country`, `city`, `latitude`, `longitude`, `rcdb_id`, `status`
- Coaster: `name`, `park_id`, `rcdb_id`, `status`

### Status dos coasters e parques

Valores possíveis: `operating`, `sbno`, `under_construction`, `defunct`

- **operating** — em operação normal
- **sbno** — Standing But Not Operating; fisicamente presente mas temporariamente parado (manutenção prolongada, pode voltar)
- **under_construction** — em construção, ainda não aberto
- **defunct** — permanentemente encerrado

O status do parque é extraído do primeiro link `g.htm?id=` da página do parque no RCDB.  
O status de cada coaster é derivado da seção em que aparece na página do parque (`<h4>Operating Roller Coasters`, `<h4>SBNO Roller Coasters`, etc.).

---

## IA — Resumos e tags temáticas

### Visão geral

Um batch job periódico processa reviews em texto livre e gera dois outputs para cada parque e coaster: um resumo textual e um conjunto de tags temáticas com contagem de menções e sentimento (positivo/negativo/misto).

### Regras

- Só é gerado quando há no mínimo 10 reviews para o parque ou coaster
- Roda periodicamente (ex: semanal) ou quando acumular N reviews novas desde a última geração
- Output salvo como JSONB no campo `ai_summary` do parque ou coaster
- App lê o JSON cacheado — sem chamada de IA em tempo real

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

## Fora do escopo (todas as fases)

- Filtros por tipo, altura ou velocidade de coasters
- Dados técnicos dos coasters (apenas nome)
- Feed de atividade de amigos (timeline)
- Notificações push
- Modo offline
- Armazenamento de vídeos no servidor (apenas URLs do YouTube)
- Peso diferenciado nas avaliações para usuários pagantes ou com mais créditos
- Categorias fixas de avaliação (notas por subcategoria) — substituído por tags emergentes via IA
