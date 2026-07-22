/**
 * The metric registry.
 *
 * Metric *definitions* for every active city × indicator are materialized here with a
 * PENDING value — the whole catalog is authored now, values arrive as data is gathered
 * (see docs/DATA_LINKS.md). To attach a real value, add an entry to SOURCED_VALUES keyed
 * by metricId; nothing else changes. This keeps "block on real data" honest: until a
 * metricId appears in SOURCED_VALUES it renders as "data pending", never a guess.
 */

import { INDICATORS, INDICATOR_BY_ID } from '../../compare/dimensions';
import { PENDING, type City, type MetricRecord, type SourcedValue, type VerdictDefinition } from '../schema';
import { ACTIVE_CITIES, PRIMARY_GEOGRAPHY } from './geography';

export function metricId(city: City, indicatorId: string): string {
  return `${city}_${indicatorId}`;
}

/**
 * Sourced values, keyed by metricId. EMPTY until real data is gathered and verified.
 * Each future entry must be a complete SourcedValue (validated in CI). Example shape:
 *
 *   [metricId('vienna', 'modal_share_car')]: {
 *     value: 25, year: 2024, source: 'Stadt Wien', sourceUrl: 'https://…',
 *     tier: 1, methodology: 'resident mobility survey (~2,000)', confidence: 'high',
 *     retrievedDate: '2026-07-23', lastVerified: '2026-07-23',
 *   },
 */
export const SOURCED_VALUES: Record<string, SourcedValue> = {
  // (intentionally empty — populate from docs/DATA_LINKS.md)
};

function buildRecord(city: City, indicatorId: string): MetricRecord {
  const indicator = INDICATOR_BY_ID.get(indicatorId)!;
  const id = metricId(city, indicatorId);
  const sourced = SOURCED_VALUES[id];
  return {
    metricId: id,
    city,
    dimension: indicator.dimension,
    indicatorId,
    unit: indicator.unit,
    geography: PRIMARY_GEOGRAPHY[city],
    definition: indicator.label,
    ...(indicator.expectedTripBasis ? { tripBasis: indicator.expectedTripBasis } : {}),
    ...(indicator.expectedPopulation ? { population: indicator.expectedPopulation } : {}),
    intendedSource: 'see docs/DATA_LINKS.md',
    value: sourced ?? PENDING,
  };
}

/** The full registry: every active city × every indicator. */
export const REGISTRY: MetricRecord[] = ACTIVE_CITIES.flatMap((city) =>
  INDICATORS.map((ind) => buildRecord(city, ind.indicatorId)),
);

export function registryFor(city: City): MetricRecord[] {
  return REGISTRY.filter((r) => r.city === city);
}

/**
 * Authored verdicts. These compare the three active cities on verdict-eligible
 * indicators. Every verdict lists all three cities as candidate leaders, so no city is
 * structurally favored — the eventual leader is whatever the sourced data shows. While
 * data is PENDING, all of these correctly SUPPRESS (proving the data-first gate).
 */
export const VERDICTS: VerdictDefinition[] = [
  {
    verdictId: 'v_cycling_protected_per_capita',
    dimension: 'cycling',
    claim: 'protected cycle length per capita',
    criterion: 'More protected cycle length per 1,000 residents is better (higher-better).',
    direction: 'higher-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'cycle_protected_km_per_capita')),
    caveat: 'Provision ≠ usage or quality; does not capture connectivity or maintenance.',
  },
  {
    verdictId: 'v_cycling_mode_share',
    dimension: 'cycling',
    claim: 'cycling modal share',
    criterion: 'A higher share of trips by bike is better (higher-better).',
    direction: 'higher-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'modal_share_bike')),
    caveat: 'Reflects culture, terrain, and trip length — not infrastructure alone.',
  },
  {
    verdictId: 'v_pedestrian_area_per_capita',
    dimension: 'pedestrian',
    claim: 'pedestrian-priority area per capita',
    criterion: 'More pedestrian-priority area per resident is better (higher-better).',
    direction: 'higher-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'pedestrian_area_per_capita')),
    caveat: 'Area alone ignores footway quality, shade, and network continuity.',
  },
  {
    verdictId: 'v_walking_mode_share',
    dimension: 'pedestrian',
    claim: 'walking modal share',
    criterion: 'A higher share of trips on foot is better (higher-better).',
    direction: 'higher-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'modal_share_walk')),
    caveat: 'Driven partly by compactness and land use, not just pedestrian design.',
  },
  {
    verdictId: 'v_mobility_car_share',
    dimension: 'mobility',
    claim: 'car modal share',
    criterion: 'A lower share of trips by car is better for this dimension (lower-better).',
    direction: 'lower-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'modal_share_car')),
    caveat: 'Lower car share is not automatically better if accessibility falls; see trade-offs.',
  },
  {
    verdictId: 'v_mobility_car_ownership',
    dimension: 'mobility',
    claim: 'car ownership rate',
    criterion: 'Fewer cars per 1,000 residents is better for this dimension (lower-better).',
    direction: 'lower-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'car_ownership_per_1000')),
    caveat: 'Ownership ≠ use; company/lease registration can distort city figures.',
  },
  {
    verdictId: 'v_planning_low_speed',
    dimension: 'planning',
    claim: '30 km/h street coverage',
    criterion: 'A higher share of low-speed streets is better for safety/livability (higher-better).',
    direction: 'higher-better',
    cities: ACTIVE_CITIES,
    metricIds: ACTIVE_CITIES.map((c) => metricId(c, 'low_speed_street_share')),
    caveat: 'Coverage ≠ compliance or enforcement; excludes arterial through-traffic design.',
  },
];
