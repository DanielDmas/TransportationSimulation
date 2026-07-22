/**
 * Comparison dimensions and their indicators.
 *
 * An Indicator is the city-agnostic thing being measured (e.g. "protected cycle length
 * per capita"). Each city contributes one MetricRecord per indicator, sharing the same
 * `indicatorId`, so the comparison engine can line them up. Indicators also carry the
 * `betterDirection` used by verdicts and a `comparabilityKeys` hint listing which
 * definition fields must align for a cross-city comparison to be honest.
 */

import type { BetterDirection, Dimension, TripBasis, PopulationBase } from '../contract/schema';

export interface Indicator {
  indicatorId: string;
  dimension: Dimension;
  label: string;
  unit: string;
  /** Direction that would count as "better", if a verdict is authored for it. */
  betterDirection: BetterDirection;
  /**
   * For descriptive indicators (esp. socioeconomic) no "better" verdict is allowed;
   * they are shown as differences only.
   */
  allowsVerdict: boolean;
  /** Expected trip/population basis, so mismatches surface as comparability warnings. */
  expectedTripBasis?: TripBasis;
  expectedPopulation?: PopulationBase;
  /** Short note on the biggest comparability trap for this indicator. */
  comparabilityNote?: string;
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  planning: 'Urban planning & land use',
  cycling: 'Cycling infrastructure',
  pedestrian: 'Pedestrian infrastructure',
  mobility: 'Mobility & modal split',
  socioeconomic: 'Socioeconomic — who is affected',
};

export const INDICATORS: Indicator[] = [
  // --- Mobility & modal split ---
  {
    indicatorId: 'modal_share_car',
    dimension: 'mobility',
    label: 'Car modal share (resident trips)',
    unit: '% of trips',
    betterDirection: 'lower-better',
    allowsVerdict: true,
    expectedTripBasis: 'trip',
    expectedPopulation: 'resident',
    comparabilityNote: 'Resident vs. all-users and trip vs. stage differ by city survey.',
  },
  {
    indicatorId: 'car_ownership_per_1000',
    dimension: 'mobility',
    label: 'Car ownership',
    unit: 'cars per 1,000 residents',
    betterDirection: 'lower-better',
    allowsVerdict: true,
    comparabilityNote: 'Lease/company cars registered centrally can distort city figures.',
  },
  {
    indicatorId: 'avg_commute_minutes',
    dimension: 'mobility',
    label: 'Average commute time',
    unit: 'minutes',
    betterDirection: 'lower-better',
    allowsVerdict: false, // shorter is not unambiguously "better" (density, sprawl)
    comparabilityNote: 'City-boundary vs. metro commute are very different measures.',
  },
  // --- Cycling ---
  {
    indicatorId: 'cycle_protected_km_per_capita',
    dimension: 'cycling',
    label: 'Protected cycle length per capita',
    unit: 'km per 1,000 residents',
    betterDirection: 'higher-better',
    allowsVerdict: true,
    comparabilityNote: '"Protected" vs. painted/advisory lanes are counted differently.',
  },
  {
    indicatorId: 'modal_share_bike',
    dimension: 'cycling',
    label: 'Cycling modal share',
    unit: '% of trips',
    betterDirection: 'higher-better',
    allowsVerdict: true,
    expectedTripBasis: 'trip',
    expectedPopulation: 'resident',
  },
  // --- Pedestrian ---
  {
    indicatorId: 'pedestrian_area_per_capita',
    dimension: 'pedestrian',
    label: 'Pedestrian-priority area per capita',
    unit: 'm² per resident',
    betterDirection: 'higher-better',
    allowsVerdict: true,
    comparabilityNote: 'Definition of "pedestrian zone" varies; OSM one-method helps.',
  },
  {
    indicatorId: 'modal_share_walk',
    dimension: 'pedestrian',
    label: 'Walking modal share',
    unit: '% of trips',
    betterDirection: 'higher-better',
    allowsVerdict: true,
    expectedTripBasis: 'trip',
    expectedPopulation: 'resident',
  },
  // --- Urban planning & land use ---
  {
    indicatorId: 'population_density',
    dimension: 'planning',
    label: 'Population density',
    unit: 'residents per km²',
    betterDirection: 'higher-better', // context-dependent; verdict off by default below
    allowsVerdict: false,
    comparabilityNote: 'City boundary choice dominates this number.',
  },
  {
    indicatorId: 'low_speed_street_share',
    dimension: 'planning',
    label: '30 km/h street coverage',
    unit: '% of street-km',
    betterDirection: 'higher-better',
    allowsVerdict: true,
    comparabilityNote: 'Derive identically from OSM maxspeed for comparability.',
  },
  // --- Socioeconomic (descriptive only; never a verdict) ---
  {
    indicatorId: 'car_access_lowest_income',
    dimension: 'socioeconomic',
    label: 'Car access, lowest income group',
    unit: '% of households with a car',
    betterDirection: 'lower-better',
    allowsVerdict: false,
    comparabilityNote: 'Descriptive: shows who depends on cars, not which city is better.',
  },
  {
    indicatorId: 'transport_cost_budget_share',
    dimension: 'socioeconomic',
    label: 'Transport cost as share of household budget',
    unit: '% of spending',
    betterDirection: 'lower-better',
    allowsVerdict: false,
  },
];

export const INDICATOR_BY_ID: Map<string, Indicator> = new Map(
  INDICATORS.map((i) => [i.indicatorId, i]),
);

export function indicatorsForDimension(dimension: Dimension): Indicator[] {
  return INDICATORS.filter((i) => i.dimension === dimension);
}
