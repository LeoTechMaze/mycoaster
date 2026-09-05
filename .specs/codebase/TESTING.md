# TESTING.md — MyCoaster

> Escopo: API (`/api`). O app React Native ainda não tem estratégia de testes
> definida — será adicionada quando a fase de UI começar.

## Estado atual

A documentação antiga dizia "nenhum teste existe". **Isso está desatualizado.**
O que existe hoje:

- **Framework:** Jest 30 + Supertest 7 (`api/package.json`, `devDependencies`).
- **Camada de integração: madura.** 6 suites de rota em `api/tests/routes/`
  (`auth`, `users`, `parks`, `coasters`, `credits`, `reviews`).
- **Ciclo de vida do DB de teste:** `api/tests/globalSetup.js` cria o banco se
  não existir, roda `migrate.latest()`, `TRUNCATE ... CASCADE` e `seed.run()`
  uma vez antes de toda a execução. `api/tests/teardown.js`
  (`setupFilesAfterEnv`) fecha handles de Redis/Firebase por suite; cada suite
  fecha seu próprio pool Knex no `afterAll`.
- **Execução serial:** `maxWorkers: 1` / `jest --runInBand` — as suites
  compartilham um DB real e correriam em condição de corrida em paralelo.
- **Smoke endpoint:** `GET /health` (`api/src/app.js`) já existe e checa
  Postgres + Redis (200 `ok` / 503 `degraded`).
- **Helpers:** `tests/helpers/db.js` (`db`, `truncate`),
  `tests/helpers/auth.js` (`generateToken` — assina JWT interno).

O que **falta** e este doc planeja: a camada **Unit**, o caminho de execução
**sem DB**, o **smoke pós-deploy** e a definição (adiada) de **E2E**.

---

## As 4 camadas (mapeadas para este projeto)

| Camada | O que testa | Onde roda | Toca o banco? | Quando | Status aqui |
| --- | --- | --- | --- | --- | --- |
| **Unit** | Função isolada (validação Zod, encode/decode de cursor) | Memória, sem rede | Não | A cada commit | ❌ Não existe — **trabalho principal** |
| **Integration** | Rotas + banco + lógica juntos | DB de teste descartável | Sim, e pode destruir | A cada commit/PR | ✅ Maduro — documentar, não redesenhar |
| **Smoke / Health** | "A build subiu e responde?" | Staging/Prod real | Lê, nunca escreve | Logo após deploy | 🟡 Endpoint existe; falta o check pós-deploy |
| **E2E / Synthetic** | Fluxo de usuário completo num ambiente vivo | Staging | Sim, dado de teste isolado | Pós-deploy / monitor | ⏸️ **Adiado** — sem alvo de staging ainda |

> ⚠️ **Atenção à tabela genérica:** "cálculo de badge" costuma ser exemplo de
> teste *unit*. **Aqui não é** — o `credit_count` e o `badge_level` são
> mantidos por um trigger PL/pgSQL
> (`api/migrations/20260515000009_create_credit_trigger.js`), não por código
> JS. Logo, badges são cobertos **só na integração**. Não procure código JS de
> badge para "unitar".

---

## Unit (net-new — foco da implementação)

### Decisão que torna isso implementável: caminho de execução sem DB

`globalSetup.js` cria/migra/seeda Postgres **incondicionalmente**. Testes unit
não podem depender disso. Solução: separar as duas execuções com Jest
`projects`, mantendo o caminho de integração atual **intacto**.

`api/jest.config.js` passa a ser:

```js
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['**/tests/unit/**/*.test.js'],
      // SEM globalSetup, SEM teardown de DB — roda em memória, rápido
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['**/tests/routes/**/*.test.js'],
      setupFiles: ['./tests/env.js'],
      setupFilesAfterEnv: ['./tests/teardown.js'],
      globalSetup: './tests/globalSetup.js',
      testTimeout: 30000,
      maxWorkers: 1,
    },
  ],
};
```

Scripts em `api/package.json`:

```json
"test":             "jest --runInBand",
"test:unit":        "jest --selectProjects unit",
"test:integration": "jest --selectProjects integration --runInBand"
```

`test:unit` não precisa de Postgres/Redis — roda em qualquer lugar, rápido, a
cada commit. `test` continua rodando ambos via `--runInBand` (o `maxWorkers: 1`
do projeto de integração garante a serialização).

### Superfície unit real (é fina — a API é validação + SQL)

| Alvo | Arquivo | O que testar |
| --- | --- | --- |
| `UUID_RE` / `uuid` | `src/utils/schemas.js` | aceita UUIDs de seed estruturados; rejeita `not-a-uuid`, string vazia, UUID malformado (ver [[feedback_zod_v4_uuid]]) |
| `isGeoSearch` | `src/utils/search.js` | `true` só com lat+lng+radius; `false` se faltar qualquer um |
| `listQuerySchema` | `src/utils/search.js` | `.refine` aprova geo completo OU country/city; rejeita request misto/vazio |
| `success` | `src/utils/response.js` | envelope `{ data }`; inclui `meta` só quando passado; aplica `status` |
| `encodeCursor` / `decodeCursor` | **extrair de** `src/routes/reviews.js` → `src/utils/pagination.js` | round-trip encode→decode; rejeita (422) cursor com data inválida ou id não-UUID |

> **Pré-requisito do melhor alvo unit:** `encodeCursor`/`decodeCursor` hoje são
> funções privadas dentro de `reviews.js`, cobertas só pela rota (integração).
> Extrair para `src/utils/pagination.js` e exportá-las as torna unit-testáveis
> e reutilizáveis pelos próximos endpoints paginados.

> **Não unitar:** `haversine` e `avgRatingSql` (`search.js`) retornam **strings
> SQL** — só fazem sentido executadas contra o banco; ficam na integração.

---

## Integration (existente — manter o padrão)

Já cobre os cenários-chave: auth (token válido/ausente → 401), unicidade de
review (409), exclusividade mútua coaster/park (422), faixa de rating (422),
not-found (404), ownership (403), paginação por cursor e o trigger de crédito.

Padrão para **adicionar uma suite** (modelo: `tests/routes/reviews.test.js`):

1. `const app = require('../../src/app')` + `supertest`.
2. Fixtures vêm do seed (`seeds/01_parks_and_coasters.js`); IDs estruturados
   (`10000000-...`, `20000000-...`, `30000000-...`). Insira usuários extras com
   `.onConflict('id').ignore()`.
3. `beforeEach`: limpe as tabelas que a suite escreve (`db('reviews').del()`);
   gere token com `generateToken({ id, email })`.
4. `afterAll`: limpe o que inseriu e `await db.destroy()`.
5. Asserções no envelope: sucesso → `res.body.data`; erro → `res.body.error`.

**Lacunas a fechar conforme novas rotas chegam:** limite de upload de fotos
por usuário/período (regra de nível de rota, C-004), precisão da query geo
(haversine vs. bounding-box, C-005), e o exchange Firebase→JWT em
`POST /auth/login` (C-002).

---

## Smoke / Health (endpoint pronto — falta o check pós-deploy)

`GET /health` já valida Postgres + Redis. Falta automatizar o disparo **depois
do deploy**, contra a URL real, **somente leitura**.

Implementar `api/scripts/smoke.js` (ou um passo de CI) que:

1. `GET ${BASE_URL}/health` → espera 200 e `{ status: 'ok' }`.
2. (Opcional) 1–2 GETs públicos de leitura (ex.: `GET /api/v1/reviews/coaster/:id`
   de um id de seed conhecido) → espera 200.
3. Sai com código ≠ 0 se algo falhar, para travar a promoção do deploy.

Nunca escreve. Roda contra staging/prod logo após o deploy.

---

## E2E / Synthetic (definido, adiado)

**Adiado até existir um alvo de staging com pipeline de deploy** — não há
evidência de um hoje, e não vale especificar infra sem casa.

Quando houver staging, definir um fluxo sintético contra o ambiente vivo:
login (Firebase→JWT) → criar credit → criar review → ler de volta → limpar.
Requisitos: usuário sintético dedicado + dados isolados + limpeza ao final
(nunca tocar dados reais de usuário). Roda pós-deploy / em monitor contínuo.

---

## Comandos de gate

```bash
# raiz do /api
npm run test:unit          # sem DB — rápido, a cada commit
npm run test:integration   # requer Postgres + Redis de teste
npm test                   # unit + integration (serial)
node scripts/smoke.js      # pós-deploy, contra BASE_URL (read-only)
```

**CI sugerido:** `test:unit` em todo push (sem serviços); `test:integration`
em PR com Postgres+Redis como serviços; `smoke` como passo pós-deploy.

---

## Notas

- A lógica de trigger de crédito (`GREATEST(credit_count - 1, 0)`) é PL/pgSQL —
  testada **só na integração** (insert/delete e o reflexo em
  `credit_count`/`badge_level`), nunca em unit.
- `tests/teardown.js` existe porque `globalTeardown` roda em outro registro de
  módulos e não fecha os singletons Redis/Firebase que as suites realmente
  abriram — não remover sem entender o "open handle" que ele resolve.
- Testes de migração (rodar `migrate:latest` em DB limpo + `migrate:rollback`)
  são feitos implicitamente pelo `globalSetup`; um teste de rollback explícito
  pode ser adicionado se as migrations ficarem mais arriscadas.
</content>
</invoke>
