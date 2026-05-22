# Spec: RCDB Scraper — Workflow n8n
**Projeto:** MyCoaster  
**Task ClickUp:** [86b9zev0u — Configurar e implementar scraper RCDB](https://app.clickup.com/t/86b9zev0u)  
**Workflow n8n:** https://techmaze-n8n.qokhkh.easypanel.host/workflow/ODfn4gK0Zo1stLsp  
**Data:** 2026-05-16  
**Status:** Pronto para implementação

---

## Objetivo

Implementar um workflow n8n que faz scraping periódico do site RCDB (rcdb.com) e popula as tabelas `parks` e `coasters` no PostgreSQL via upsert, usando `rcdb_id` como chave de idempotência.

---

## Como o site RCDB funciona

### Estrutura de URLs

O RCDB usa IDs numéricos sequenciais para **todas** as páginas:

```
https://rcdb.com/1.htm       → pode ser um coaster (ex: Raptor)
https://rcdb.com/4529.htm    → pode ser um parque (ex: Cedar Point)
```

O mesmo padrão `/{id}.htm` serve tanto para parques quanto para coasters. **Não há prefixo ou separação de namespace entre os dois tipos.**

### Como distinguir página de parque de página de coaster

A distinção está no `<title>` da página:

| Tipo | Formato do `<title>` | Exemplo |
|------|---------------------|---------|
| **Coaster** | `{Nome} - {Parque} ({Cidade}, {Estado}, {País})` | `Raptor - Cedar Point (Sandusky, Ohio, United States)` |
| **Parque** | `{Nome} ({Cidade}, {Estado}, {País})` | `Cedar Point (Sandusky, Ohio, United States)` |

**Regra prática:** se o `<title>` contém ` - ` separando dois nomes, é um coaster. Se começa direto com o nome do parque seguido de parênteses, é um parque.

---

## Estratégia de scraping: listing pages (não iterar IDs sequencialmente)

### ❌ Abordagem ineficiente (NÃO usar)

Iterar `/1.htm`, `/2.htm`, `/3.htm`... até o ID mais alto (~23.000+). Isso geraria 23.000+ requisições desnecessárias, a maioria para coasters (que podem ser obtidos via páginas de parque).

### ✅ Abordagem correta: usar as listing pages do RCDB

O RCDB oferece páginas de listagem paginadas que agregam coasters por filtro. A URL-chave é:

```
https://rcdb.com/r.htm?ot=2&ol={location_id}&page={n}
```

- `ot=2` → tipo "Roller Coasters"
- `ol={location_id}` → filtro por localização (país, estado, cidade)
- `page={n}` → paginação (começa em 1, sem `page=` é a página 1)

#### IDs de localização relevantes

| País | `location_id` |
|------|--------------|
| Brasil | `26724` |
| World (todos) | *(omitir `ol=`)* |

Exemplo para todos os coasters do Brasil:
```
https://rcdb.com/r.htm?ot=2&ol=26724&page=1
https://rcdb.com/r.htm?ot=2&ol=26724&page=2
...
https://rcdb.com/r.htm?ot=2&ol=26724&page=9
```

Brasil tem **212 coasters** distribuídos em **9 páginas** (~24 por página).

Para cobertura global: **13.219 coasters** em **551 páginas**.

---

## O que cada tipo de página contém

### Listing page (`r.htm?ot=2&ol=...`)

Cada linha da tabela contém:
- **Nome do coaster** com link → `<a href="/1657.htm">Alpen Blitz</a>` → `rcdb_id = 1657`
- **Nome do parque** com link → `<a href="/4946.htm">Playcenter São Paulo</a>` → `rcdb_id = 4946`
- Status (Operating, Defunct, Relocated, etc.)

O cabeçalho da página indica total e paginação:
```
Found: 212 (Page 1 of 9)
```

### Página de parque (`/{park_id}.htm`)

Contém:
- **Nome do parque** → `<h1>Cedar Point</h1>`
- **Localização** → links para cidade, estado/região, país (via `location.htm?id=...`)
- **Latitude e longitude** → embutidas nas URLs do Google Maps no corpo da página:
  ```
  https://www.google.com/maps/place/41.481972,-82.684563/@41.481972,-82.684563,...
  ```
  Regex para extração: `maps\.google\.com/maps/place/(-?\d+\.\d+),(-?\d+\.\d+)`
- **Lista de coasters** — tabelas "Operating Roller Coasters" e "Defunct Roller Coasters" com links para cada coaster

### Página de coaster (`/{coaster_id}.htm`)

Contém:
- **Nome do coaster** → `<h1>Raptor</h1>`
- **Link para o parque** → `<a href="/4529.htm">Cedar Point</a>`
- **Lat/lng próprio** (localização da atração dentro do parque) → mesmo padrão de Google Maps
- Dados técnicos (altura, velocidade, comprimento — **fora do escopo do MVP**)

---

## Fluxo do workflow n8n

### Visão geral

```
Schedule Trigger
    ↓
Para cada país alvo (Brasil + futuramente outros):
    ↓
Fetch listing page (página 1) → extrair total de páginas
    ↓
Loop por todas as páginas → coletar pares (coaster_rcdb_id, park_rcdb_id, coaster_name)
    ↓
Deduplica park_rcdb_ids únicos
    ↓
Para cada park_id único → fetch park page → extrair name, city, country, lat, lng
    ↓
Upsert parks no PostgreSQL (conflict on rcdb_id)
    ↓
Upsert coasters no PostgreSQL (conflict on rcdb_id)
```

---

## Nodes do workflow (configuração detalhada)

### Node 1: Schedule Trigger

- **Tipo:** Schedule Trigger
- **Configuração:** Cron `0 3 * * *` (todo dia às 3h UTC)
- Para execução manual de carga inicial: executar via "Execute workflow" no painel

---

### Node 2: Set — Definir países alvo

- **Tipo:** Set
- **Output:** array `countries` com os location_ids a processar

```json
{
  "countries": [
    { "name": "Brazil", "location_id": "26724" }
  ]
}
```

> Para expansão global futura: adicionar mais entradas ao array.

---

### Node 3: Split In Batches — iterar por país

- **Tipo:** SplitInBatches
- Processa um país por vez

---

### Node 4: HTTP Request — Fetch página 1 da listing

- **Tipo:** HTTP Request
- **URL:** `https://rcdb.com/r.htm?ot=2&ol={{ $json.location_id }}&page=1`
- **Método:** GET
- **Response:** HTML completo

---

### Node 5: HTML Extract — Extrair total de páginas

- **Tipo:** HTML Extract
- **Seletor CSS:** `#report p` (ou o elemento que contém "Found: X (Page 1 of Y)")
- **Regex no texto extraído:** `Page 1 of (\d+)` → capturar número total de páginas

Alternativamente, extrair o link da última página do paginador:
- Seletor: `a[href*="page="]` (último link de paginação)
- Extrair número máximo de `page=` nos hrefs

---

### Node 6: Code — Gerar array de URLs de todas as páginas

- **Tipo:** Code (JavaScript)

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

### Node 7: HTTP Request — Fetch cada página da listing (com throttle)

- **Tipo:** HTTP Request
- **URL:** `{{ $json.url }}`
- **Rate limiting:** adicionar nó **Wait** de 1-2 segundos entre chamadas para não sobrecarregar o RCDB
- **On Error:** Continuar (log e seguir para próxima página)

---

### Node 8: HTML Extract — Extrair coasters e parques da listing

- **Tipo:** HTML Extract
- **Extração de cada linha** da tabela de resultados:

Para cada `<tr>` da tabela de resultados:
- **Coaster name:** `td:nth-child(2) a` → `.text()`
- **Coaster rcdb_id:** `td:nth-child(2) a` → atributo `href` → regex `/(\d+)\.htm/` → grupo 1
- **Park name:** `td:nth-child(3) a` → `.text()`
- **Park rcdb_id:** `td:nth-child(3) a` → atributo `href` → regex `/(\d+)\.htm/` → grupo 1

> **Nota:** o `ot=2` inclui todos os coasters (operando + desativados). Para filtrar apenas operando, adicionar `&ex` na URL: `r.htm?ot=2&ol=26724&ex`. Recomendado para o MVP para reduzir volume, mas pode ser ajustado depois.

---

### Node 9: Code — Deduplica park IDs únicos

- **Tipo:** Code (JavaScript)

```javascript
const allItems = $input.all();

// Coletar todos os coasters
const coastersMap = {};
const parksMap = {};

for (const item of allItems) {
  const { coaster_rcdb_id, coaster_name, park_rcdb_id, park_name } = item.json;
  
  if (coaster_rcdb_id && coaster_name) {
    coastersMap[coaster_rcdb_id] = { rcdb_id: coaster_rcdb_id, name: coaster_name, park_rcdb_id };
  }
  if (park_rcdb_id && park_name) {
    parksMap[park_rcdb_id] = { rcdb_id: park_rcdb_id, name: park_name };
  }
}

// Retorna dois outputs: um para parques, outro para coasters
// Output 0: lista de park_ids únicos para fetch
// Output 1: todos os coasters coletados (para upsert posterior)
return [
  Object.values(parksMap).map(p => ({ json: p })),
  // coasters ficam em memória até parques serem processados
];
```

---

### Node 10: HTTP Request — Fetch cada página de parque

- **Tipo:** HTTP Request
- **URL:** `https://rcdb.com/{{ $json.rcdb_id }}.htm`
- **Rate limiting:** Wait 1-2 segundos entre chamadas
- **On Error:** Continuar (registrar erro, seguir para próximo parque)

---

### Node 11: HTML Extract + Code — Extrair dados do parque

- **Tipo:** Code (JavaScript) — processar o HTML retornado

```javascript
const html = $input.first().json.data; // HTML da página do parque
const rcdb_id = $input.first().json.rcdb_id;

// Extrair nome (h1)
const nameMatch = html.match(/<h1>([^<]+)<\/h1>/);
const name = nameMatch ? nameMatch[1].trim() : null;

// Extrair lat/lng do link Google Maps
// Padrão: maps.google.com/maps/place/{lat},{lng}/@{lat},{lng}
const coordMatch = html.match(/maps\.google\.com\/maps\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
const latitude = coordMatch ? parseFloat(coordMatch[1]) : null;
const longitude = coordMatch ? parseFloat(coordMatch[2]) : null;

// Extrair localização (cidade, estado/região, país)
// Os links de localização têm o padrão /location.htm?id=...
// O texto do breadcrumb de localização: "Cidade, Estado, País"
const locationMatch = html.match(/location\.htm\?id=\d+">([^<]+)<\/a>,\s*<a[^>]*location\.htm\?id=\d+">([^<]+)<\/a>,\s*<a[^>]*location\.htm\?id=\d+">([^<]+)<\/a>/);
let city = null, country = null;
if (locationMatch) {
  city = locationMatch[1].trim();
  // locationMatch[2] é estado/região (ignorar para MVP)
  country = locationMatch[3].trim();
}

// Fallback: para parques com apenas cidade e país (sem estado)
if (!city) {
  const simpleMatch = html.match(/location\.htm\?id=\d+">([^<]+)<\/a>,\s*<a[^>]*location\.htm\?id=\d+">([^<]+)<\/a>/);
  if (simpleMatch) {
    city = simpleMatch[1].trim();
    country = simpleMatch[2].trim();
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
    synced_at: new Date().toISOString()
  }
}];
```

---

### Node 12: PostgreSQL — Upsert parks

- **Tipo:** Postgres
- **Operação:** Execute Query

```sql
INSERT INTO parks (id, name, city, country, latitude, longitude, rcdb_id, synced_at)
VALUES (
  gen_random_uuid(),
  $1, $2, $3, $4, $5, $6, NOW()
)
ON CONFLICT (rcdb_id) DO UPDATE SET
  name       = EXCLUDED.name,
  city       = EXCLUDED.city,
  country    = EXCLUDED.country,
  latitude   = EXCLUDED.latitude,
  longitude  = EXCLUDED.longitude,
  synced_at  = NOW()
WHERE
  parks.name      IS DISTINCT FROM EXCLUDED.name       OR
  parks.city      IS DISTINCT FROM EXCLUDED.city       OR
  parks.country   IS DISTINCT FROM EXCLUDED.country    OR
  parks.latitude  IS DISTINCT FROM EXCLUDED.latitude   OR
  parks.longitude IS DISTINCT FROM EXCLUDED.longitude;
```

**Parâmetros:**
- `$1` → `{{ $json.name }}`
- `$2` → `{{ $json.city }}`
- `$3` → `{{ $json.country }}`
- `$4` → `{{ $json.latitude }}`
- `$5` → `{{ $json.longitude }}`
- `$6` → `{{ $json.rcdb_id }}`

---

### Node 13: PostgreSQL — Upsert coasters

Após todos os parques terem sido inseridos/atualizados, fazer upsert dos coasters resolvendo o `park_id` pelo `park_rcdb_id`:

```sql
INSERT INTO coasters (id, name, park_id, rcdb_id, synced_at)
SELECT
  gen_random_uuid(),
  $1,
  p.id,
  $2,
  NOW()
FROM parks p
WHERE p.rcdb_id = $3
ON CONFLICT (rcdb_id) DO UPDATE SET
  name      = EXCLUDED.name,
  park_id   = EXCLUDED.park_id,
  synced_at = NOW()
WHERE
  coasters.name    IS DISTINCT FROM EXCLUDED.name OR
  coasters.park_id IS DISTINCT FROM EXCLUDED.park_id;
```

**Parâmetros:**
- `$1` → `{{ $json.coaster_name }}`
- `$2` → `{{ $json.coaster_rcdb_id }}`
- `$3` → `{{ $json.park_rcdb_id }}`

---

### Node 14: Error Handler — Log de erros

- Cada bloco HTTP Request deve ter um caminho de erro que:
  1. Registra o `rcdb_id` que falhou e a mensagem de erro
  2. Continua o fluxo sem interromper o workflow inteiro
- Usar nó **Set** para estruturar o log e **Postgres** (tabela `scraper_errors`) ou simplesmente `console.log` via nó **Code**

---

## Resumo de requests por execução

| Escopo | Requests listing | Requests park pages | Total estimado |
|--------|-----------------|--------------------|----|
| Brasil apenas | ~9 | ~50 parques únicos | ~60 |
| Global (operating) | ~276 | ~4.673 parques | ~4.950 |
| Global (todos) | ~551 | ~6.504 parques | ~7.055 |

> Para a carga inicial, rodar o workflow manualmente com o escopo global. Para updates diários, o volume é baixo porque o upsert só atualiza quando há diferença real.

---

## Recomendações de rate limiting

- **Entre pages da listing:** 500ms de delay
- **Entre fetches de páginas de parque:** 1-2 segundos de delay
- **Timeout por request:** 10 segundos
- **Retries automáticos:** 2 tentativas com backoff exponencial (n8n gerencia nativamente)
- Evitar paralelismo alto — rodar sequencialmente ou com concorrência máxima de 2

---

## Validação pós-execução

Após a carga inicial, rodar as seguintes queries de validação no PostgreSQL:

```sql
-- Contagem geral
SELECT COUNT(*) FROM parks;    -- Esperado: ~50 (Brasil) ou ~4.673 (global)
SELECT COUNT(*) FROM coasters; -- Esperado: ~212 (Brasil) ou ~6.839 (global operating)

-- Verificar parques sem lat/lng (extração falhou)
SELECT id, name, rcdb_id FROM parks WHERE latitude IS NULL OR longitude IS NULL;

-- Verificar coasters sem park_id resolvido
SELECT id, name, rcdb_id FROM coasters WHERE park_id IS NULL;

-- Sample de dados
SELECT p.name, p.city, p.country, p.latitude, p.longitude, COUNT(c.id) AS coasters
FROM parks p
LEFT JOIN coasters c ON c.park_id = p.id
GROUP BY p.id
ORDER BY coasters DESC
LIMIT 20;
```

---

## Fora do escopo deste workflow

- Dados técnicos dos coasters (altura, velocidade, comprimento) — só serão coletados em fase futura se decidido
- Lat/lng individual de cada coaster (usa-se o lat/lng do parque pai para proximidade)
- Coasters com status "Relocated" — incluídos no upsert mas sem tratamento especial
- Imagens ou vídeos do RCDB
