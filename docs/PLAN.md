# Car Contrast Lab — How Cities Move
### Prague · Vienna · Amsterdam (· Paris later) — Software Development Plan

> **Status:** Approved plan, pre-implementation. This document and its siblings in `docs/`
> are planning artifacts only — no application code has been written yet.

---

## 1. Context & purpose

An honest, **evidence-led comparison explorer** that shows how Prague, Vienna, and Amsterdam
differ in urban planning, cycling infrastructure, pedestrian infrastructure, and overall
mobility — and, **where sourced data supports it**, which city does a given thing better,
including how differences fall across **socioeconomic groups**.

The guiding purpose (user's words): *show people that automobile policy can be more
pedestrian- and bike-friendly — without being biased. Show Prague as one situation and the
western cities as better where the data supports it. It is firstly about how urban planning,
mobility, cycling, and pedestrian paths differ — and what is better, based on reality.*

**Neutrality is structural, not aspirational.** The app is evidence-led, never
assertion-led. It never states a conclusion the data doesn't carry. Every "better" verdict is
attached to an explicit, sourced criterion the user can inspect and disagree with. Where
Prague leads (transit reach, compact core, tram culture), the app says so with equal
prominence. The thesis emerges from real differences or it doesn't appear.

### Locked decisions
1. **Stack:** React + TypeScript SPA (Vite); computation in-browser.
2. **Primary product:** *comparison explorer first;* interactive policy "what-if" sandbox is
   a **secondary** mode on the same data.
3. **Data rule:** *block on real data* — the app refuses to display any quantitative claim or
   "better" verdict that cannot be traced to the Reality Contract registry. Enforced in code.
4. **Cities:** Prague, Vienna, Amsterdam first; data model extensible to Paris with no rework.
5. **Socioeconomic depth:** *descriptive* — sourced facts about who is affected, by group and
   neighborhood. **No** distributional/causal modeling of policy effects on groups (non-goal).

---

## 2. Architecture — the one-directional pipeline

Any future Claude narration sits at the **end**, never the start.

```
REALITY CONTRACT  (registry of sourced metrics: per city, dimension, group)
        │  every value: value, year, geography, definition, source,
        │  methodology, confidence, comparability
        ▼
DATA NORMALIZATION  (align trip vs. leg, resident vs. all, city vs. metro, year)
        ▼
COMPARISON ENGINE  (differences between cities; verdicts bound to sourced criteria)
        ▼
   └─► COMPARISON EXPLORER  (primary: how cities differ · what is better · who is affected)
        ▼
EMPIRICAL PARAMETERS + DETERMINISTIC MODEL  (secondary: policy "what-if" sandbox)
        ▼
EXPLANATION LAYER  (templated now; Claude-narrated later — explains, never computes)
```

**Non-negotiable invariants**
- The UI cannot render a raw statistic or a "better" verdict that did not come through the
  registry. A typed `Metric` wrapper + a lint rule enforce this.
- Facts / estimates / model outputs are visually distinct in the UI.
- Every "better" claim exposes its criterion, direction, and sources on click.
- Cross-city numbers with mismatched definitions raise a visible **⚠️ not-directly-
  comparable** banner — a teaching moment, not silently reconciled.

---

## 3. Tech stack & tooling

| Concern | Choice |
|---|---|
| Framework | Vite + React 18 + TypeScript (strict) |
| State | Zustand |
| Charts | Recharts or visx (follow the `dataviz` skill; theme-aware light/dark) |
| Maps | MapLibre GL + open tiles, or static SVG schematics — decided in Phase 0 |
| Data authoring | Typed modules validated by Zod; registry validator in CI |
| Testing | Vitest + React Testing Library + small Playwright smoke suite |
| CI | GitHub Actions: typecheck, lint (no-bare-stat rule), unit tests, build, registry validation |

### Project structure
```
src/
  contract/           # Reality Contract: schema, registry, validators
    schema.ts         #   Metric, Verdict, Provenance, Comparability, SocioGroup
    registry/         #   one module per city × dimension (prague/cycling, vienna/…)
    validate.ts       #   runtime + build-time guard; PENDING sentinel
  compare/            # PRIMARY: comparison engine + verdict rules
    dimensions.ts  verdict.ts  normalize.ts
  model/              # SECONDARY: policy what-if sandbox (deterministic, pure)
    cities/ zones.ts demand.ts modechoice.ts policies.ts scores.ts forecast.ts
    montecarlo.ts calibration/
  explain/            # explanation layer: Explainer interface + templated impl now
  ui/                 # screens & components
  app/                # routing, store, layout
docs/
  PLAN.md  REALITY_CONTRACT.md  EDITORIAL_POLICY.md  DATA_SOURCES.md  MODEL.md
```

---

## 4. The Reality Contract (spine)

See **`REALITY_CONTRACT.md`** for the full spec. Core types:

```ts
interface Metric {
  metricId: string;                 // "prague_cycling_network_km_protected"
  city: "prague" | "vienna" | "amsterdam" | "paris";
  dimension: Dimension;             // planning | cycling | pedestrian | mobility | socioeco
  value: number | "PENDING";        // PENDING renders "data pending", never a fake number
  unit: string; year: number;
  geography: string;                // exact boundary: admin city vs. metro region
  definition: string; tripBasis?: "trip" | "leg" | "journey";
  population?: "resident" | "all" | "commuter" | "weekday";
  socioGroup?: SocioGroup;          // income quintile / neighborhood, when applicable
  methodology: string;
  source: string; sourceUrl: string;
  confidence: "high" | "medium" | "low";
  comparability: "full" | "partial" | "none";
  lastVerified: string;             // ISO date
}

interface Verdict {                 // a "better" claim is data, not prose
  claim: string;
  dimension: Dimension;
  criterion: string;                // exactly what makes it "better" + direction
  metricIds: string[];              // the sourced metrics it rests on
  comparability: "full" | "partial";// never asserted on "none"
  caveat?: string;                  // what the criterion does NOT capture
}
```
A `Verdict` renders only when its metrics are resolved (not `PENDING`) and comparability is
not `none`; otherwise the UI shows the difference **without** a "better" label.

---

## 5. The comparison explorer (PRIMARY product)

**Dimensions & example indicators**
- **Urban planning / land use:** density, street-space allocation (car vs. people), 30 km/h
  coverage, car-light ("autoluw") extent, public space reclaimed.
- **Cycling:** protected-lane km, network density & connectivity, bike modal share, parking.
- **Pedestrian:** sidewalk provision, pedestrian-priority extent, crossing safety, walk share.
- **Mobility / modal split:** modal shares (resident vs. commuter), cars per 1,000, transit
  reach & reliability, commute time, congestion, transport emissions.
- **Socioeconomic (descriptive):** car access by income group, transport cost as share of
  household budget, access to frequent transit / safe cycling by neighborhood.

**Views**
1. **City overview** — profile per dimension; every figure a provenance chip.
2. **Side-by-side compare** — 2–3 cities × a dimension; aligned indicators; ⚠️ on
   non-comparable pairs; verdict badges only where a sourced criterion earns them.
3. **"What is better, and why"** — verdict list, each expandable to criterion, metrics,
   sources, caveat. **Includes cases where Prague leads.**
4. **"Who is affected"** — socioeconomic view by income group / neighborhood, descriptive.
5. **Maps / schematics** — bike-network and pedestrian-zone extent across cities.
6. **Provenance & Limitations** — source hierarchy; what the app does *not* claim.

---

## 6. The policy "what-if" sandbox (SECONDARY mode)

Reuses the registry + a deterministic model. Pick a city, apply policy cards (transit
investment, parking reform, protected cycle network, 30 km/h zones, P+R, road pricing,
density); explore trade-offs across six scores (car dependence, accessibility, safety, street
quality, climate, affordability) with a **resident vs. commuter split** and 5/10/20-yr
forecasts. Every policy improves ≥1 score and worsens ≥1. Uncertainty via a seeded
Monte-Carlo sampler; a backtest harness must reproduce known baselines before forecasts are
trusted. See `MODEL.md`. **Scoped after the explorer ships.**

---

## 7. The data-first gate (enforcement)

1. **Type-level:** components take `Metric` / `Verdict` objects, never bare `number`.
2. **Runtime:** `PENDING` → "data pending" chip; verdict with missing/`none` data → hidden or
   downgraded to a neutral difference.
3. **Build-time:** ESLint rule + registry validator in CI fail on any statistic rendered
   outside the `Metric` pathway, any registry entry missing provenance, or any `Verdict` whose
   `metricIds` are unresolved/`PENDING`.

---

## 8. Build phases

| Phase | Deliverable |
|---|---|
| **0 — Contract, editorial policy & scaffold** | Write the `docs/` specs; `contract/schema.ts` + dimension list; Vite/React/TS scaffold; Vitest; ESLint no-bare-stat rule; CI; registry validator; seed a *small* set of genuinely Tier-1-sourced headline metrics, everything else `PENDING`. |
| **1 — Comparison engine + verdict rules** | Normalization/comparability; verdict evaluation; symmetric-coverage tests (Prague-leads cases present); "no verdict without sourced criterion" enforced by test. |
| **2 — Comparison explorer UI** | All six views; every number a provenance chip. |
| **3 — Data sourcing to green** (parallel from Phase 0) | Fill `PENDING` from Tier-1 → Tier-2 → Tier-3; log each in `DATA_SOURCES.md`. |
| **4 — Policy what-if sandbox** | Deterministic model, resident/commuter split, six scores, forecasts, Monte-Carlo, calibration/backtest. |
| **5 — Claude explanation layer** | `explain/claude.ts` behind the existing interface; backend passes only registry facts + model outputs; Claude narrates, never computes. Needs a backend for key handling. |
| **Later** | Paris plugs in as a fourth registry set — no schema change. |

---

## 9. Verification

- **Unit (Vitest):** normalization aligns definitions; a `Verdict` cannot render without
  resolved, comparable metrics; symmetric-coverage test asserts Prague-leads verdicts exist
  where data supports; sandbox model deterministic; scores bounded; Monte-Carlo seeded.
- **Gate tests:** statistic outside the `Metric` path fails CI; `PENDING` shows "data pending";
  non-comparable pairs raise the ⚠️ banner.
- **E2E (Playwright):** open explorer → pick a dimension → compare three cities → see aligned
  indicators, a verdict with criterion + sources, and the "who is affected" view.
- **Editorial review:** manual pass — no unearned "better" claim; symmetric city treatment.
- **Manual:** run the app (`/run` skill); every number and verdict has a working provenance
  popover.

---

## 10. What is missing (explicit gaps)

**Data — load-bearing under the "block on real data" rule**
- Tier-1 values for most indicators across all three cities and every dimension. Known
  fragments: Vienna 2024 modal split 25/34/30/11, ~381 cars/1,000, ~300k commuters; Amsterdam
  bike share ~⅓ of trips, ~0.4 cars/household; Czechia *country* car dominance (81.9%
  pass-km). But **Prague-city** modal split, cycling-network km, pedestrian-zone extent,
  commute times, congestion, emissions are **not yet sourced** — and **Czechia-country ≠
  Prague-city** (must never be conflated).
- **Socioeconomic data by income group / neighborhood** — hardest to source at city
  granularity; may force coarser grouping than ideal.
- **Comparability metadata** for every cross-city pair (trip vs. leg, resident vs. all, city
  vs. metro, year) — without it, verdicts cannot be issued honestly.
- Whether this environment's network access permits fetching official sources live, or data
  must be hand-entered from provided documents.

**Verdict / editorial decisions to confirm**
- Exact **"better" criteria** per dimension (e.g. cycling judged by modal share, protected-km
  per capita, or safety outcomes?) — must be written into `EDITORIAL_POLICY.md` before any
  verdict renders.
- How to present near-ties / conflicting data (show "comparable — no clear leader"?).

**Product / scope still open**
- Map fidelity — real GIS network maps vs. schematic diagrams.
- Neighborhood granularity for the socioeconomic view (named districts vs. income quintiles).
- Whether shareable/permalinked comparisons are wanted.

**Technical (later phases)**
- Phase 5 needs a backend/serverless function to hold the Claude API key — an SPA cannot call
  the API safely client-side; deployment target undecided.
- Expert review: the design calls for transport/urban experts (incl. a car-restriction
  skeptic) to attack the model and the verdicts — sourcing them precedes any public release.

---

## 11. Recommended next step

Execute **Phase 0**: finalize the `docs/` specs (incl. `EDITORIAL_POLICY.md` and its "better"
criteria), define `contract/schema.ts` + the dimension list, and stand up the scaffold with
the data-first gate. Everything downstream depends on that schema and those criteria, and all
of it can be built before the first real datapoint lands.
