# Data Links — what to fetch for me

> Your shopping list for tomorrow. Every link below is a source I want you to pull from (or
> upload the resulting file). I found these via WebSearch but **could not open them** (egress
> is blocked here), so treat each as a **starting point to verify** — confirm the exact
> table/year/definition when you download. Deep-links can drift; the dataset **name** next to
> each link is the reliable anchor.
>
> **How to hand back:** for each value, capture the provenance fields from
> `REALITY_CONTRACT.md` and add a row to `DATA_SOURCES.md` — or just **upload the raw file**
> (PDF/CSV/XLSX) into the repo and I'll extract + log it. Priority markers: ⭐ = highest value,
> 🔁 = best for cross-city comparability, 🧭 = reproducible one-method (no permission needed).

---

## 0. Cross-city, comparable sources (do these FIRST) 🔁

Same definition across all cities beats three richer-but-incomparable national figures.

- ⭐🔁 **Eurostat — City Statistics / Urban Audit (transport):** dataset code **`urb_ctran`**
  (incl. "journeys to work by car", public transport, etc.), plus `urb_ctran`-family for
  motorization. Metadata: https://ec.europa.eu/eurostat/cache/metadata/en/urb_esms.htm ·
  Database entry: https://ec.europa.eu/eurostat/data/database · Easier browse/export via
  DBnomics: https://db.nomics.world/Eurostat/urb_ctran
  - *Grab:* modal split + cars-per-1000 for Prague, Wien, Amsterdam (+ Paris) at both **city**
    and **functional-urban-area** level, latest available year. Note the year per city.
- 🔁 **EPOMM TEMS — comparable modal split, 600+ EU cities:** http://tems.epomm.eu/ ·
  city list: http://tems.epomm.eu/cities.php
  - *Grab:* the modal-split % for each city **and the survey year + basis** TEMS records
    (some entries are older — the year is essential for comparability).
- 🔁 **Eurostat GISCO — Urban Audit city boundaries (for the geography definitions in B0):**
  https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/urban-audit
- **EEA / Eurostat — transport emissions** (common basis): start at
  https://ec.europa.eu/eurostat/data/database (env_air_gge / transport) — capture per-city or
  per-country basis and note it.

---

## 1. Cycling & pedestrian infrastructure via OpenStreetMap (one method, all cities) 🧭

The **most comparable** way to get cycle-lane km, pedestrian-zone area, and 30 km/h coverage
is to derive them yourself with an identical query per city — no portal permission needed.

- 🧭 **Geofabrik extracts (.osm.pbf):**
  - Czech Republic: https://download.geofabrik.de/europe/czech-republic.html
  - Austria: https://download.geofabrik.de/europe/austria.html
  - Netherlands: https://download.geofabrik.de/europe/netherlands.html
  - (France later: https://download.geofabrik.de/europe/france.html)
- 🧭 **Overpass Turbo (interactive, no download):** https://overpass-turbo.eu/
  - *Grab (identical query per city bbox/admin area):* length of `highway=cycleway` +
    `cycleway=track/lane`; area of `highway=pedestrian` + `living_street`; street-km with
    `maxspeed=30`. Save the query text as the "methodology".
- *If you'd rather not run GIS:* just download the three `.pbf` files and upload them; I can
  write and run the extraction here (this is local computation, no egress needed).

---

## 2. Prague

- ⭐ **TSK Praha — Ročenka dopravy (Prague Transport Yearbook)** — richest single Prague doc
  (modal split, traffic intensities, cycling counts): site https://www.tsk-praha.cz/ (section
  "Výroční zprávy a ročenky"). Example direct PDF (find the latest year):
  https://www.tsk-praha.cz/static/udi-rocenka-2022-cz.pdf
- **Geoportál Praha — open data (cycle network, land use, GIS):**
  https://opendata.geoportalpraha.cz/ · EN: https://geoportalpraha.cz/en/data-and-services/open-data
- **Prague open-data catalog / cycling dashboard:** https://opendata.praha.eu/ ·
  https://data.praha.eu/dashboardy/cyklodoprava · Golemio cycling: https://golemio.cz/cs/node/22
- **PID / ROPID — transit GTFS (frequency & reach):** direct feed
  https://data.pid.cz/PID_GTFS.zip · open-data page https://pid.cz/en/opendata/
- ⭐ **ČSÚ — 2021 Census commuting (dojížďka) + car access:** open data
  https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data · commuting summary
  https://scitani.gov.cz/basic-data-about-commuting-to-work-and-to-school · commuting dataset
  (NKOD): https://data.gov.cz/dataset?iri=https%3A%2F%2Fdata.gov.cz%2Fzdroj%2Fdatov%C3%A9-sady%2F00025593%2Fdc244dd58d23a8354ef226db2eb2e6be
- **ČSÚ — Public Database (VDB) + Prague Statistical Yearbook** (income/motorization by
  district): https://vdb.czso.cz · Yearbook 2022 PDF:
  https://csu.gov.cz/docs/107508/57187f68-b586-7388-caf1-73a17289ebd1/330120-22.pdf
  - ⚠️ **Prague-city only** — do not substitute Czechia-country figures.

---

## 3. Vienna (Wien)

- ⭐ **Modal split 2024 (official, incl. methodology + sample):** City press release
  https://presse.wien.gv.at/presse/2025/03/16/modal-split-2024-weitere-zunahme-bei-oeffis-und-radfahren-zu-fuss-gehen-nach-wie-vor-auf-rekordniveau
  (known values: 25% car / 34% PT / 30% walk / 11% bike; ~2,000-resident survey).
- **Cycle network / infrastructure (data.gv.at):**
  - Hauptradverkehrsnetz Wien (main cycle network):
    https://www.data.gv.at/katalog/dataset/1ea3d3e8-fa07-4c37-af68-eb588d439de2
  - Radinfrastruktur — Flächen und Anteile (areas & shares, annual):
    https://www.data.gv.at/katalog/dataset/b1f73940-b2b2-401d-b9e4-9894418d3270
  - Radinfrastruktur nach Bezirken (by district):
    https://www.data.gv.at/katalog/dataset/1872f15d-7a48-4566-876d-d38b91fdf328
- **Stadt Wien open data home:** https://digitales.wien.gv.at/open-data/ (portal: data.wien.gv.at)
- **Wiener Linien — transit GTFS:** https://www.wienerlinien.at/open-data · dataset
  https://www.data.gv.at/katalog/dataset/wiener-linien-fahrplandaten-gtfs-wien
- ⭐ **Statistik Austria — STATcube (commuting "Pendler", motorization by district, income):**
  https://www.statistik.at/datenbanken/statcube-statistische-datenbank · free access:
  https://www.statistik.at/en/databases/statcube-statistical-database/free-access
  - *Grab:* Vienna Pendler (inbound commuters + mode), Kfz per district, income by district.

---

## 4. Amsterdam

- ⭐ **Gemeente Amsterdam O&S — mobility datasets** (vehicle ownership, trips/person by mode,
  avg distance/time):
  - https://onderzoek.amsterdam.nl/dataset/mobiliteit-in-amsterdam
  - https://onderzoek.amsterdam.nl/dataset/mobiliteit-en-openbaar-vervoer-in-amsterdam
  - "Verkeer in cijfers 2024": https://onderzoek.amsterdam.nl/artikel/verkeer-in-cijfers-2024
  - O&S home (has an API + custom table export): https://onderzoek.amsterdam.nl/
- **City GIS data (bike lanes, pedestrian zones, parking):** https://data.amsterdam.nl/
- ⭐ **CBS — Kerncijfers wijken en buurten (car ownership + income by neighborhood):** latest
  table https://www.cbs.nl/nl-nl/cijfers/detail/85984NED (2024) · dossier:
  https://www.cbs.nl/nl-nl/dossier/nederland-regionaal/wijk-en-buurtstatistieken · GIS
  webservice (PDOK): https://www.pdok.nl/ogc-webservices/-/article/cbs-wijken-en-buurten
- **CBS ODiN (national travel survey — modal split, trip basis):** research description
  https://www.cbs.nl/nl-nl/longread/rapportages/2025/onderweg-in-nederland--odin---2024-onderzoeksbeschrijving?onepage=true
  — detailed tables are published on **StatLine** (search "ODiN vervoerwijzen").
  - ⚠️ ODiN is **national**; use its Amsterdam breakdown or the O&S city figures, and record
    which geography you took.

---

## 5. Socioeconomic (descriptive "who is affected")

- **Amsterdam:** CBS *Kerncijfers wijken en buurten* (car ownership + income by neighborhood) —
  links in §4. Easiest end-to-end, do this one first to prove the view.
- **Vienna:** Statistik Austria STATcube — income & motorization by district (§3).
- **Prague:** ČSÚ VDB / Prague Statistical Yearbook — income & motorization by district; ČSÚ
  Household Budget Survey for transport expenditure share (§2).
- **Cross-city:** Eurostat Household Budget Survey (transport as % of spend) via
  https://ec.europa.eu/eurostat/data/database (hbs_* ); EU transport-poverty indicators (JRC).

---

## 6. Empirical parameters & backtests (SECONDARY sandbox only — not needed for the explorer)

- **Litman / VTPI — "Transportation Elasticities":** https://www.vtpi.org/elasticities.pdf ·
  TDM Encyclopedia: https://vtpi.org/tdm/tdm11.htm
- **GIZ / SUTP — Transport Elasticities (module TD11):**
  https://transformative-mobility.org/wp-content/uploads/2024/01/GIZ_SUTP_TD11_Transport-Elasticities_EN.pdf
- **Backtest cases (before/after policy evaluations):** Eltis case studies
  https://www.eltis.org/ · CIVITAS https://civitas.eu/

---

## Fastest path if you only have an hour tomorrow
1. ⭐🔁 **Eurostat `urb_ctran`** + **EPOMM TEMS** → comparable modal split & car ownership,
   all cities, one definition. (Export CSV, upload it — I'll log it.)
2. 🧭 Download the **three Geofabrik `.pbf`** files and upload them → I compute cycle/pedestrian
   km here with an identical method (fully comparable, no egress needed).
3. ⭐ **CBS Kerncijfers** (Amsterdam) → proves the socioeconomic "who is affected" view.

Everything else can stay `PENDING` until you get to it — the app is built to show "data
pending" honestly rather than guess.
