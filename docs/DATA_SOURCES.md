# Data Sources — hierarchy & retrieval log (draft)

> Governs where every registry value comes from. Under the "block on real data" rule, a
> metric stays `PENDING` until it has an entry here. Draft — the log fills during Phase 3.

## Source hierarchy

| Tier | Use | Prague | Vienna | Amsterdam |
|---|---|---|---|---|
| **1 — Official** | Primary quantitative inputs | IPR Praha, DPP, ROPID, ČSÚ, Ministry of Transport | Stadt Wien / Statistik Wien, Wiener Linien, Statistik Austria | Gemeente Amsterdam, CBS |
| **2 — European** | Standardized cross-country definitions | Eurostat, European Commission, EEA | ← same | ← same |
| **3 — Research** | Parameters, context | Transport institutes, universities, OECD, World Bank, EIB | ← same | ← same |
| **4 — Secondary** | Discovering claims & debates only — **not** primary quantitative source | Newspapers, think tanks, advocacy groups | ← same | ← same |

## Retrieval log (template)

Each sourced metric records one row:

| metricId | value | year | geography | definition | source | url | tier | methodology | comparability | retrieved | verifier |
|---|---|---|---|---|---|---|---|---|---|---|---|
| _example_ `vienna_modal_split_car_resident` | 25% | 2024 | Vienna admin city | resident trips by private motor | Stadt Wien | … | 1 | mobility survey | partial (vs. Prague TBD) | _pending_ | _pending_ |

## Known fragments to verify (from design notes — NOT yet logged)

- Vienna 2024 modal split 25% car / 34% PT / 30% walk / 11% bike; ~381 cars/1,000; ~300k
  daily commuters; ~70:30 environmental-network vs. motorized within the city.
- Amsterdam bike ~⅓ of resident trips; ~0.4 cars/household; ~¼ of adults own a car;
  "autoluw, niet autoloos."
- Czechia **country** passenger transport: 81.9% pass-km by car, 11.8% bus/coach/metro/tram;
  0.81 vehicles/person. **Country-level — not a proxy for Prague-city.**

## Gaps (highest priority to source)

- **Prague-city** (not country): modal split, cars per 1,000, protected cycle-lane km,
  pedestrian-zone extent, average commute time, congestion, transport emissions.
- **Socioeconomic** by income group / neighborhood for all three cities: car access,
  transport cost burden, access to frequent transit / safe cycling.
- **Comparability metadata** for every cross-city pair (trip vs. leg, resident vs. all, city
  vs. metro, survey year).

## Open question

Does this environment permit fetching official sources live, or must values be hand-entered
from documents the user provides? This determines the Phase-3 workflow.
