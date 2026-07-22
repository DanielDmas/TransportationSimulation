# Editorial Policy — when the app may say "X is better" (draft)

> The neutrality contract. Its purpose is to let the app reach honest "better" conclusions
> **where data supports them** while structurally preventing bias. Draft — the per-dimension
> criteria below are **proposals to confirm** before any verdict renders.

## Principles

1. **Evidence-led, never assertion-led.** The app never states a conclusion the data doesn't
   carry. A "better" claim exists only as a `Verdict` backed by sourced metrics and an
   inspectable criterion.
2. **No verdict on non-comparable data.** `comparability === "none"` → shown as a difference,
   never as a verdict.
3. **Symmetric coverage.** Dimensions where **Prague leads** are surfaced with equal
   prominence to where the western cities lead. A Phase-1 test asserts Prague-leads verdicts
   exist wherever data supports them.
4. **No value-laden adjectives on raw data.** Framing is "differs" until a criterion earns
   "better."
5. **Every verdict carries a caveat** naming what the criterion does not capture.
6. **Near-ties are labeled, not forced.** When metrics are close or sources conflict, the app
   shows "comparable — no clear leader," not a manufactured winner.

## Proposed "better" criteria per dimension (TO CONFIRM)

These are candidate definitions of "better." They must be agreed and frozen before verdicts
render, because the choice of criterion determines the conclusion.

| Dimension | Candidate criterion (direction) | Notes / caveat to attach |
|---|---|---|
| **Cycling** | Higher **protected-lane km per capita** AND higher bike modal share | Modal share alone conflates culture with infrastructure; report both |
| **Pedestrian** | Larger **pedestrian-priority area per capita** AND lower pedestrian casualty rate | Casualty data definitions differ by country — check comparability |
| **Urban planning** | Higher share of **street space allocated to people vs. cars** | Hard to source uniformly; may stay `PENDING` |
| **Mobility** | Lower **car dependence** without loss of accessibility (paired metrics) | "Better" here is contested — present as trade-off, not absolute |
| **Socioeconomic** | *Descriptive only — no verdict.* Show who is affected | Distributional judgments are an explicit non-goal |

**Open question for the user:** for cycling and pedestrian dimensions, should "better" be
judged primarily by **infrastructure provision** (protected-km, zone extent), by **outcomes**
(modal share, safety), or by **both required to agree**? This choice is the single biggest
lever on what the app concludes.

## What the app will not do

- Assert that any city is "better overall." Verdicts are per-dimension, per-criterion.
- Present the secondary sandbox's model outputs as predictions or facts.
- Use Czechia-country data to characterize Prague-city.
