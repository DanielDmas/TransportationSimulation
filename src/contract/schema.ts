/**
 * Reality Contract — core types.
 *
 * This module is the single source of truth for what a "fact" is in this project.
 * Governing rule (see docs/REALITY_CONTRACT.md): no quantitative claim and no
 * "better" verdict may reach the UI unless it traces to a sourced entry defined here.
 *
 * Design consequence: a metric's *definition* (what we intend to measure, for which
 * geography, under which trip/population basis) is separated from its *sourced value*
 * (the number plus full provenance). Definitions exist now; values arrive as data is
 * gathered. Until then a value is the PENDING sentinel, which the UI renders as
 * "data pending" — never a guess.
 */

export const CITIES = ['prague', 'vienna', 'amsterdam', 'paris'] as const;
export type City = (typeof CITIES)[number];

export const DIMENSIONS = [
  'planning',
  'cycling',
  'pedestrian',
  'mobility',
  'socioeconomic',
] as const;
export type Dimension = (typeof DIMENSIONS)[number];

/** How a trip is counted. A bike-then-train journey is 1 journey / 2 stages. */
export type TripBasis = 'trip' | 'stage' | 'journey';

/** Whose movement the metric describes. */
export type PopulationBase = 'resident' | 'all' | 'commuter' | 'weekday';

export type Confidence = 'high' | 'medium' | 'low';

/**
 * Source tier (see docs/DATA_SOURCES.md):
 * 1 official · 2 European standardized · 3 research · 4 secondary (discovery only).
 */
export type SourceTier = 1 | 2 | 3 | 4;

/**
 * Comparability of one metric against a matched metric in another city.
 * Derived pairwise in compare/normalize.ts — NOT hand-asserted per metric.
 */
export type Comparability = 'full' | 'partial' | 'none';

/** Descriptive socioeconomic grouping (no distributional modeling — facts only). */
export interface SocioGroup {
  kind: 'income-quintile' | 'neighborhood';
  label: string;
}

/** The PENDING sentinel — the default value of every metric until it is sourced. */
export const PENDING = 'PENDING' as const;
export type Pending = typeof PENDING;

/**
 * A metric's identity and measurement intent. Authored up front; never changes
 * when the value lands. `geography`, `tripBasis`, and `population` are what make
 * two cities' metrics comparable, so they are part of the definition, not the value.
 */
export interface MetricDefinition {
  metricId: string;
  city: City;
  dimension: Dimension;
  /** Ties to an Indicator in compare/dimensions.ts so cities line up. */
  indicatorId: string;
  unit: string;
  /** Exact boundary, e.g. "Vienna administrative city" vs "Prague functional urban area". */
  geography: string;
  /** What is counted, in words. */
  definition: string;
  tripBasis?: TripBasis;
  population?: PopulationBase;
  socioGroup?: SocioGroup;
  /** Where we plan to source it (a docs/DATA_LINKS.md entry). Documentation only. */
  intendedSource: string;
}

/** A sourced value with full provenance. Present only once real data is attached. */
export interface SourcedValue {
  value: number;
  year: number;
  source: string;
  sourceUrl: string;
  tier: SourceTier;
  methodology: string;
  confidence: Confidence;
  retrievedDate: string; // ISO date
  lastVerified: string; // ISO date
}

/** A metric definition plus its value (sourced or PENDING). This is what the registry holds. */
export interface MetricRecord extends MetricDefinition {
  value: SourcedValue | Pending;
}

/**
 * Result of resolving a metric for display. A discriminated union so UI code
 * cannot accidentally read a number off a PENDING metric.
 */
export type ResolvedMetric =
  | { status: 'sourced'; def: MetricDefinition; value: SourcedValue }
  | { status: 'pending'; def: MetricDefinition };

/** Direction that counts as "better" for a verdict criterion. */
export type BetterDirection = 'higher-better' | 'lower-better';

/**
 * A "better" claim, authored as data (see docs/EDITORIAL_POLICY.md). A verdict may
 * only render when every referenced metric is sourced and the cities are comparable.
 */
export interface VerdictDefinition {
  verdictId: string;
  dimension: Dimension;
  /** Neutral phrasing of the comparison, e.g. "protected cycle length per capita". */
  claim: string;
  /** Exactly what "better" means here + the direction that earns it. */
  criterion: string;
  direction: BetterDirection;
  /** Cities compared (>= 2). */
  cities: City[];
  /** One metricId per city, all sharing an indicator. */
  metricIds: string[];
  /** What the criterion does NOT capture. Required — neutrality guard. */
  caveat: string;
}

/** Per-city figure used when a verdict renders. */
export interface VerdictCityValue {
  city: City;
  value: number;
  unit: string;
}

/**
 * Outcome of evaluating a verdict against the registry.
 * - 'rendered': a clear leader was found.
 * - 'no-clear-leader': metrics resolved and comparable, but values effectively tie.
 * - 'suppressed': cannot make a claim (data pending, or not comparable).
 */
export type VerdictResult =
  | {
      status: 'rendered';
      def: VerdictDefinition;
      leader: City;
      ranking: VerdictCityValue[];
      comparability: Exclude<Comparability, 'none'>;
      comparabilityNotes: string[];
    }
  | {
      status: 'no-clear-leader';
      def: VerdictDefinition;
      ranking: VerdictCityValue[];
      comparability: Exclude<Comparability, 'none'>;
      comparabilityNotes: string[];
    }
  | {
      status: 'suppressed';
      def: VerdictDefinition;
      reason: 'pending' | 'incomparable';
      detail: string;
    };
