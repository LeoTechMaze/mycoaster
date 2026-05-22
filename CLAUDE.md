# Coaster Tracker

App mobile e rede social para entusiastas de parques de diversão e montanhas-russas.

**Posicionamento:** A casa digital do parqueiro — tracking, reviews estruturadas, galeria comunitária e conexão entre entusiastas e criadores de conteúdo do nicho.

**Plataformas:** iOS e Android  
**Stack:** React Native (sem Expo) · Node.js + Express · PostgreSQL · Redis · Firebase Auth · n8n

---

## Estrutura do repositório

```
/api          → Backend Node.js + Express
/app          → App React Native
/scraper      → Configuração do workflow n8n
/.specs       → Toda a documentação do projeto
  /.specs/project/    → Visão, roadmap e estado atual (spec-driven)
  /.specs/codebase/   → Mapeamento técnico da base de código (spec-driven)
```

---

## Documentação

### Produto & Decisões

| Doc                                                                | Descrição                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [.specs/docs/spec.md](.specs/docs/spec.md)                                   | Design spec — visão geral, público-alvo, arquitetura, features, fases e escopo |
| [.specs/docs/data-model.md](.specs/docs/data-model.md)                       | Modelo de dados — tabelas, triggers, badges, formato do ai_summary             |
| [.specs/docs/api.md](.specs/docs/api.md)                                     | Endpoints REST — rotas, métodos e descrições                                   |
| [.specs/docs/plan.md](.specs/docs/plan.md)                                   | Plano de implementação — fases, pré-requisitos e paralelismo                   |
| [.specs/docs/decisions.md](.specs/docs/decisions.md)                         | Decisões técnicas — escolhas e seus motivos                                    |
| [.specs/docs/rcdb-n8n-scraper-spec.md](.specs/docs/rcdb-n8n-scraper-spec.md) | Design Spec para o N8N scraper no RCDB                                         |

### Projeto (spec-driven — carregar ao planejar features)

| Doc                                                    | Descrição                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| [.specs/project/PROJECT.md](.specs/project/PROJECT.md) | Visão, posicionamento, público-alvo e métricas de sucesso              |
| [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) | Fases 0–5 com status de cada item                                      |
| [.specs/project/STATE.md](.specs/project/STATE.md)     | Memória persistente — decisões, bloqueadores, lições e próximos passos |

### Codebase (spec-driven — carregar ao implementar)

| Doc                                                                | Descrição                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [.specs/codebase/STACK.md](.specs/codebase/STACK.md)               | Stack completa — runtimes, libs, versões e scripts                             |
| [.specs/codebase/ARCHITECTURE.md](.specs/codebase/ARCHITECTURE.md) | Arquitetura do sistema, fluxo de auth, fluxo de dados                          |
| [.specs/codebase/STRUCTURE.md](.specs/codebase/STRUCTURE.md)       | Mapa do repositório — o que está construído vs. pendente                       |
| [.specs/codebase/CONVENTIONS.md](.specs/codebase/CONVENTIONS.md)   | Convenções de código, DB, error handling e env vars                            |
| [.specs/codebase/INTEGRATIONS.md](.specs/codebase/INTEGRATIONS.md) | Todas as integrações externas (Firebase, Redis, n8n, storage, LLM)             |
| [.specs/codebase/TESTING.md](.specs/codebase/TESTING.md)           | Estratégia de testes (nenhum teste existe ainda)                               |
| [.specs/codebase/CONCERNS.md](.specs/codebase/CONCERNS.md)         | Riscos técnicos identificados — 4 itens críticos para resolver antes das rotas |

---

## Execução

Tasks de implementação estão no **ClickUp** → Board "🎢 HapFun — Produto", organizadas por fase (0–5) com subtasks granulares.

---

## Convenções

- Badges no banco em inglês (`rookie`, `enthusiast`, `veteran`, `legend`) — traduzido via i18n no app
- Reviews com peso igual para todos os usuários
- Fotos com moderação (status: pending → approved)
- Vídeos apenas via URL do YouTube (sem armazenamento)
- IA processada em batch, cacheada como JSONB — sem chamadas em tempo real
