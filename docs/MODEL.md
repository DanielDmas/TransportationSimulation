# Model — the secondary policy what-if sandbox

> Status: scaffold only. This documents the *secondary* feature. The primary product is the
> comparison explorer; the sandbox is scoped after it ships (see `PLAN.md`).

## What exists now (`src/model/`)
- **`types.ts`** — the six trade-off scores (each 0..100, higher = better outcome) and the
  `Policy` shape.
- **`policies.ts`** — the policy deck as data. Each card declares authored effect *directions*
  drawn from the design notes.
- **`scores.ts`** — `applyPolicies(baseline, policies)`: pure, deterministic, clamps to
  [0, 100]. `NEUTRAL_BASELINE` is a labeled placeholder (all axes at 50) used only for
  demonstration and tests.

## Honesty boundaries (important)
- Effect **magnitudes are NOT empirical** and must never be shown as predictions. They encode
  which score goes up and which goes down — the trade-off structure — not a calibrated forecast.
- The **baseline** must come from real registry data before any city-specific run is shown.
- The **trade-off invariant** (every policy improves ≥1 score and worsens ≥1) is enforced by
  test (`scores.test.ts`).

## Later phases (gated by real data)
- Replace authored directions with **empirical elasticities** (each with a citation + range;
  see `DATA_LINKS.md` §6), so effects become defensible.
- Add the **resident vs. commuter split**, zones, 5/10/20-year forecasts with phasing/induced
  demand, a seeded **Monte-Carlo** uncertainty pass, and a **backtest harness** that must
  reproduce a known historical policy change before any forecast is trusted.
