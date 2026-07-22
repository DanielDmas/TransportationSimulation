# Reality Contract (draft spec)

> The formal agreement that governs **every quantitative claim** the app can make. No number
> and no "better" verdict may appear in the UI unless it traces to an entry defined here.
> This is a planning draft; the machine-enforced version lives in `src/contract/schema.ts`.

## Purpose

Separate four categories of statement and never let them blur:

| Category | Example | Treatment |
|---|---|---|
| **Observed** | Vienna's 2024 modal split | Directly sourced, Tier-1 |
| **Measured** | Average traffic speed | Directly sourced |
| **Estimated** | Trips affected by a policy | Clearly labeled estimate + range |
| **Simulated** | Effect of doubling parking price | Model output, labeled, with uncertainty |

The UI must render these categories with **distinct visual treatment**.

## The `Metric` record

Every metric carries full provenance (fields as in `PLAN.md` §4). Required for **all**
entries: `metricId, city, dimension, value, unit, year, geography, definition, methodology,
source, sourceUrl, confidence, comparability, lastVerified`. Optional where applicable:
`tripBasis, population, socioGroup`.

- `value` is `number | "PENDING"`. **`PENDING` is the default** for every metric until a
  Tier-1/2/3 source is attached; it renders as a neutral "data pending" chip, never a guess.
- `geography` must state the **exact boundary** — administrative city vs. metropolitan region.
  Prague-city and Czechia-country are **different geographies** and must never be conflated.
- `comparability` is judged **against the other cities' matched metric**: `full` (same
  definition/basis/period), `partial` (broadly comparable, note the caveat), `none` (not
  comparable — may be shown as context but never as a verdict).

## The `Verdict` record

A "better" claim is data, not prose (fields as in `PLAN.md` §4). Rules:
- May reference only `metricId`s that resolve to real (non-`PENDING`) values.
- May not be issued when `comparability === "none"`.
- Must carry a `criterion` stating exactly what "better" means and in which direction.
- Must carry a `caveat` naming what the criterion does **not** capture.
- Coverage must be **symmetric** — verdicts where Prague leads are authored and surfaced with
  the same prominence as verdicts where Vienna/Amsterdam lead. Enforced by test (Phase 1).

## Empirical parameters (for the secondary sandbox only)

Elasticities and causal relationships used by the policy model are a **separate** record type
carrying `estimate, lowerBound, upperBound, studyContext, applicabilityPrague,
applicabilityVienna, applicabilityAmsterdam, source`. The model **may use** them and the
explanation layer **may explain** them; nothing may **invent** them. Uncertainty is always a
range, never a silent point value.

## Registry organization

One module per `city × dimension` under `src/contract/registry/` (e.g.
`prague/cycling.ts`). A build-time validator asserts: every entry has all required fields;
every `Verdict.metricIds` resolves; no statistic is rendered outside the `Metric` pathway.

## Traceability requirement

A user must be able to click any displayed statistic and see its source, year, geography,
definition, methodology, retrieval date, and comparability. If any of these is unknown, the
metric stays `PENDING`.
