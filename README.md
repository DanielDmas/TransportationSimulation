# TransportationSimulation

**Car Contrast Lab — How Cities Move: Prague · Vienna · Amsterdam (· Paris later)**

An honest, evidence-led comparison explorer of how these cities differ in urban planning,
cycling, pedestrian infrastructure, and mobility — showing *what is better where the data
supports it*, including across socioeconomic groups. A secondary policy "what-if" sandbox
lets users explore trade-offs on the same data.

Core principle: **block on real data** — the app refuses to display any statistic or "better"
verdict that cannot be traced to a sourced entry in the Reality Contract.

## Status

The **engine and app shell are built and green** (typecheck, 34 unit tests, lint, registry
validation, production build). The Reality Contract registry is intentionally **empty of
values** — every metric reads "data pending" until real data is gathered (see
`docs/DATA_LINKS.md`). Nothing fake is ever shown; that is enforced in code.

## Getting started

```bash
npm install
npm run dev            # comparison explorer (all figures "data pending" until data lands)
npm test               # 34 unit tests — the data-first gate & neutrality rules
npm run typecheck
npm run lint           # includes the custom no-bare-stat gate
npm run validate:registry
npm run build
```

## How it is organized

- `src/contract/` — the **Reality Contract**: schema, the resolve gate, registry (all
  `PENDING`), and validators. No number reaches the UI except through here.
- `src/compare/` — the **comparison engine**: dimensions/indicators, cross-city comparability,
  and the **verdict** engine that only says "X is better" when sourced data + a criterion earn it.
- `src/model/` — the **secondary** policy what-if sandbox (deterministic; not calibrated).
- `src/explain/` — the explanation layer (templated now; Claude-narrated later, same interface).
- `src/ui/` — the explorer shell; `MetricValue` is the component-level gate.

## Planning documents (`docs/`)

- [`PLAN.md`](docs/PLAN.md) — master development plan, architecture, phases, gaps
- [`REALITY_CONTRACT.md`](docs/REALITY_CONTRACT.md) — the data-provenance contract
- [`EDITORIAL_POLICY.md`](docs/EDITORIAL_POLICY.md) — neutrality rules & "better" criteria
- [`DATA_NEEDS.md`](docs/DATA_NEEDS.md) — expanded data requirements & acquisition methods
- [`DATA_LINKS.md`](docs/DATA_LINKS.md) — **the shopping list**: concrete source links to fetch
- [`DATA_SOURCES.md`](docs/DATA_SOURCES.md) — source hierarchy & retrieval log
- [`MODEL.md`](docs/MODEL.md) — the secondary sandbox model notes
