# Data Needs & Acquisition Guide

> Companion to `DATA_SOURCES.md`. This file answers two questions: **(1) exactly what data
> the project needs** (expanded, per dimension and city), and **(2) how to gather it** —
> what I can do from here, and what you (or an open-network environment) must do.

---

## Part A — What I can and cannot gather from this environment

I probed the network on 2026-07-22. Result:

| Capability | Status | Consequence |
|---|---|---|
| **WebSearch** | ✅ Works | I can *find* sources and *surface candidate values with their official source URL* (e.g. it returned Vienna's 2024 modal split 25/34/30/11 from a 2,000-resident City survey). |
| **WebFetch / curl / direct download / open-data APIs** | ❌ Blocked | Every external host (`ec.europa.eu`, `opendata.cbs.nl`, `data.gv.at`, Wikipedia…) returns `403 CONNECT rejected` from the org egress policy. I cannot open portals, download CSVs, call APIs, or read primary-source PDFs. |
| **Reading files you upload** | ✅ Works | If you drop source documents/CSVs into the repo or attach them, I can parse them and fill the registry. |

**Bottom line.** I can produce a **"candidate value + source-to-verify" worklist** via
WebSearch — a big head start — but I **cannot** perform the verified Tier-1 primary-source
extraction that the "block on real data" rule requires. Verification needs one of:
1. **You** download/verify from the primary source and fill the retrieval log; or
2. **You upload** the source documents/datasets and I extract + log them; or
3. This runs in an **open-egress environment**, and I fetch and extract directly.

Until then, every metric stays `PENDING` (which is the safe default, by design).

---

## Part B — The data the project needs (expanded, by dimension)

Notation for each item: **metric — unit — ideal granularity — why it matters**. Every item
also needs the provenance fields from `REALITY_CONTRACT.md` (year, geography, definition,
methodology, source, comparability).

### B0. Cross-cutting definitions to pin FIRST (before any number is trusted)
These aren't metrics — they're the decisions that make metrics comparable. Get them wrong and
every downstream verdict is false.
- **Geography boundary per city:** administrative city vs. functional urban area / metro
  region. Fix one primary boundary per city + optionally a metro figure. **Prague-city ≠
  Czechia-country — never substitute one for the other.**
- **Trip basis:** trip vs. stage/leg (a bike-then-train journey is 1 trip / 2 stages — cities
  count differently).
- **Population base:** residents only vs. all users (incl. commuters/visitors) vs. weekday.
- **Survey year & method:** modal splits come from different survey years and methods per city.

### B1. Mobility / modal split
- Modal split shares (car / public transport / walk / bike) — % — **resident**, and
  separately **commuter** where available — the headline comparison.
- Car ownership — cars per 1,000 residents (and per household) — city + metro.
- Transit supply — network length, stop density, service frequency/reliability — city.
- Average commute time & distance — minutes / km — resident + inbound commuter.
- Congestion — delay index or avg. speed — city corridors.
- Transport CO₂ / emissions — t/capita or total — city.
- Daily inbound commuter volume & mode — count + % by mode — metro→city.

### B2. Cycling infrastructure
- Protected cycle-lane length — km, and **km per capita** — city (define "protected" vs.
  painted vs. advisory — huge comparability trap).
- Network density & connectivity — km per km² / % of streets with provision — city.
- Bike modal share — % of trips — resident.
- Bike parking capacity — spaces (esp. at stations) — city.
- Cycling safety — cyclist casualties per million trips or per km cycled — city.

### B3. Pedestrian infrastructure
- Pedestrian-priority / car-free area — hectares, and **per capita** — city.
- Sidewalk provision — % of streets with adequate footway — city (often unmeasured).
- Walking modal share — % of trips — resident.
- Pedestrian safety — pedestrian casualties per capita / per trip — city.
- 30 km/h street coverage — % of street-km — city.

### B4. Urban planning / land use
- Population & density — residents/km² — city + inner core.
- Street-space allocation — % of public space for cars (moving+parked) vs. people — city
  (rarely published; may stay `PENDING` or need GIS derivation).
- Car-light ("autoluw") / low-traffic zone extent — hectares or % of core — city.
- On-street parking supply & price — spaces + €/hour by zone — city.
- Public space reclaimed from cars — m²/year or cumulative — city.

### B5. Socioeconomic (DESCRIPTIVE — who is affected)
*Facts only; no modeling of policy effects on groups.*
- Car access by income group — % of households with a car, by income quintile — city, and by
  neighborhood.
- Transport cost burden — transport as % of household budget, by income group — city.
- Access to frequent transit — % of population within X min of frequent service, by
  neighborhood income — city.
- Access to safe cycling — % near protected network, by neighborhood income — city.
- Spatial equity — where lower-income residents live relative to good mobility — neighborhood.

### B6. (Secondary sandbox only) Empirical parameters — elasticities
Needed only for the policy what-if model, not the comparison explorer. Each needs
`estimate + range + study context + applicability` and a real citation — **never invented**.
- Parking price → car use elasticity.
- Transit frequency/fare → ridership elasticity.
- Cycle-network provision → bike mode-share response.
- Road capacity → induced demand.
- Fuel/road-pricing → car-km elasticity.

### B7. (Secondary sandbox only) Historical backtest cases
Real past policy changes with **before/after measured effects**, to validate the model can
reproduce reality (e.g. a Vienna parking-zone expansion or an Amsterdam paid-parking
extension, with the measured mode-shift and the pre-conditions).

---

## Part C — How to gather it (concrete methods, per city)

### C1. Official open-data portals & flagship documents (Tier 1 — best)
| City | Portal / source | What to pull |
|---|---|---|
| **Prague** | **TSK Praha** — *Ročenka dopravy Praha* (Prague Transport Yearbook, annual PDF) | modal split, traffic intensities, cycling counts — the single richest Prague doc |
| | **IPR Praha / Geoportal Praha** (`geoportalpraha.cz`) | GIS: cycle network, land use, zones |
| | **ROPID / PID** (`pid.cz` open data) | GTFS transit feed (frequency/reach) |
| | **ČSÚ** — Veřejná databáze (VDB) + Census 2021 | commuting (dojížďka), car ownership, income by district |
| **Vienna** | **Stadt Wien Open Data** (`data.wien.gv.at`) | GIS cycle network, pedestrian zones, parking zones |
| | **Stadt Wien / Wiener Linien modal-split survey** (press + report) | annual modal split + methodology |
| | **Wiener Linien open data** | GTFS transit feed |
| | **Statistik Austria — STATcube**; **data.gv.at** | commuting (Pendler), car ownership, income by district |
| **Amsterdam** | **Gemeente Amsterdam O&S** (`onderzoek.amsterdam.nl`, `data.amsterdam.nl`, `maps.amsterdam.nl`) | mobility reports, GIS bike/pedestrian layers, parking |
| | **CBS StatLine** (`opendata.cbs.nl`, OData API) | car ownership, income & car access by neighborhood (Kerncijfers wijken en buurten) |
| | **CBS ODiN** (Onderweg in Nederland travel survey) | modal split, trip basis |

### C2. Standardized cross-city sources (Tier 2 — best for COMPARABILITY)
These use one definition across cities, which is worth more than three richer-but-incomparable
national figures.
- **Eurostat Urban Audit / Cities** (`urb_*` datasets, API): modal split, cars per 1,000,
  commute — same definitions across Prague/Vienna/Amsterdam/Paris.
- **EPOMM TEMS** (The EPOMM Modal Split Tool): directly comparable European city modal splits
  (note: some entries are dated — check year).
- **EEA**: transport emissions on a common basis.
- **OECD Metropolitan / Functional Urban Area database**: metro-level comparability.

### C3. Reproducible infrastructure measurement (best for cycling/pedestrian km)
Because "cycle-lane km" definitions differ by city, the *most comparable* approach is to
**derive it yourself with one method across all cities**:
- **OpenStreetMap** via Overpass API or Geofabrik extracts: count `cycleway`/`highway=cycleway`
  km, `pedestrian`/`living_street` area, `maxspeed=30` street-km — identical query per city =
  full comparability. (Document the query as the "methodology".)
- **GTFS feeds** (per city, above) → compute transit frequency/reach with one script → a
  comparable "access to frequent transit" metric for B1 and B5.

### C4. Socioeconomic (Part B5)
- **Amsterdam:** CBS *Kerncijfers wijken en buurten* (car ownership + income by neighborhood)
  — excellent granularity.
- **Vienna:** Statistik Austria (income & motorization by district), Stadt Wien small-area
  statistics.
- **Prague:** ČSÚ household budget survey (transport expenditure) + income/motorization by
  district; Census 2021 for car access.
- **Cross-city:** Eurostat Household Budget Survey (transport % of spend), EU JRC transport-
  poverty indicators.

### C5. Elasticities & backtest cases (Part B6–B7, secondary)
- **Litman / VTPI TDM Encyclopedia — "Transportation Elasticities"**: a sourced compendium.
- **Google Scholar** for European parking-price and transit-fare elasticity studies; capture
  the estimate + confidence interval + study context.
- **Backtests:** SUMP case studies via **Eltis / CIVITAS**, plus city evaluation reports.

### C6. What needs a human, not a download
- **Paywalled research** and **survey microdata** (raw travel-survey records).
- **Methodology details** not published online (email the statistical office / city).
- **Expert review** — the design calls for transport/urban experts, incl. a car-restriction
  skeptic, to attack the verdicts before release. This is outreach only you can do.

---

## Part D — How to hand data back so it becomes usable

For each metric, provide a row for the `DATA_SOURCES.md` retrieval log with **all** of:
`metricId · value · unit · year · geography · definition · tripBasis · population ·
methodology · source · sourceUrl · tier · comparability · retrievedDate`.

Three equally good delivery methods:
1. **Fill the log rows** yourself (a spreadsheet/CSV I can import is ideal).
2. **Upload the source files** (PDF/CSV/XLSX) into the repo or attach them — I'll extract and
   log them, flagging anything ambiguous.
3. **Enable open egress** for a session — I'll fetch, extract, and log directly, then you
   spot-check.

If a field is unknown, the metric **stays `PENDING`** — that is correct behavior, not a bug.

---

## Part E — Comparability landmines (check every cross-city pair)
1. **Prague-city vs. Czechia-country** — the biggest trap; country car-dominance ≠ Prague.
2. **Trip vs. stage/leg** — inflates/deflates walk and bike+PT shares.
3. **Resident-only vs. all-users vs. weekday** — Vienna's commuter inflow behaves opposite to
   its residents; mixing bases fabricates conclusions.
4. **City boundary vs. metro / functional urban area** — modal split flips at the edge.
5. **Survey year mismatch** — a 2024 vs. 2017 comparison isn't like-for-like.
6. **"Cycle-lane km" definition** — protected vs. painted vs. advisory vs. shared.
Whenever two cities' matched metrics disagree on any of these, the pair is `comparability:
partial` or `none`, and no verdict may be issued on it.

---

## Part F — Suggested priority order
1. **Pin B0 definitions** + choose one primary boundary per city.
2. **Headline modal split + car ownership** for all three cities (Eurostat Urban Audit first
   for comparability; then each city's own survey for depth).
3. **Cycling & pedestrian km** via the OSM one-method approach (fully comparable, no
   permission needed).
4. **Socioeconomic B5** for at least one city end-to-end (Amsterdam via CBS is easiest) to
   prove the "who is affected" view.
5. Everything else fills in as `PENDING` clears.

---

## Offer
If you want, I can run a **WebSearch harvest now** and produce a pre-filled candidate table
(value + official source URL + suggested comparability flag) for the Part-B headline metrics
across all three cities — clearly marked **UNVERIFIED / to be confirmed against primary
source**, so you or I can verify them the moment one of the Part-D channels is open. Say the
word and I'll generate it into `DATA_SOURCES.md`.
