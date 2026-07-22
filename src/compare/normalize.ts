/**
 * Cross-city comparability.
 *
 * Two cities' metrics are only honestly comparable when their measurement bases line up.
 * `assessComparability` derives a 'full' | 'partial' | 'none' verdict from the metric
 * *definitions* (geography type, trip basis, population base, survey-year gap) plus the
 * indicator's expectations — it is never hand-asserted. This is what powers the
 * ⚠️ not-directly-comparable banner and gates whether a Verdict may render.
 */

import { INDICATOR_BY_ID } from './dimensions';
import type { Comparability, MetricRecord, ResolvedMetric } from '../contract/schema';

export interface ComparabilityAssessment {
  level: Comparability;
  notes: string[];
}

/** How far apart survey years may be before we downgrade comparability. */
const YEAR_PARTIAL_GAP = 3;
const YEAR_NONE_GAP = 8;

/** Classify a geography string into a coarse boundary type for comparison. */
function boundaryType(geography: string): 'city' | 'metro' | 'country' | 'other' {
  const g = geography.toLowerCase();
  if (g.includes('country') || g.includes('national') || g.includes('czechia')) return 'country';
  if (g.includes('metro') || g.includes('functional urban') || g.includes('region')) return 'metro';
  if (g.includes('city') || g.includes('administrative') || g.includes('municipal')) return 'city';
  return 'other';
}

/**
 * Assess whether two sourced metrics for the same indicator are comparable.
 * Callers should only pass metrics that share an indicatorId.
 */
export function assessComparability(
  a: ResolvedMetric & { status: 'sourced' },
  b: ResolvedMetric & { status: 'sourced' },
): ComparabilityAssessment {
  const notes: string[] = [];
  let level: Comparability = 'full';

  const downgrade = (to: Comparability, note: string) => {
    notes.push(note);
    // 'none' beats 'partial' beats 'full'
    if (to === 'none' || (to === 'partial' && level === 'full')) level = to;
  };

  // Geography boundary must be the same kind.
  const ba = boundaryType(a.def.geography);
  const bb = boundaryType(b.def.geography);
  if (ba !== bb) {
    // City vs. country is never comparable (the Prague-city vs. Czechia-country trap).
    if (ba === 'country' || bb === 'country') {
      downgrade('none', `Geography mismatch: ${a.def.geography} vs. ${b.def.geography}.`);
    } else {
      downgrade('partial', `Different boundary type: ${a.def.geography} vs. ${b.def.geography}.`);
    }
  }

  // Trip basis (trip vs. stage vs. journey).
  if (a.def.tripBasis && b.def.tripBasis && a.def.tripBasis !== b.def.tripBasis) {
    downgrade('partial', `Trip basis differs: ${a.def.tripBasis} vs. ${b.def.tripBasis}.`);
  }

  // Population base (resident vs. all vs. commuter vs. weekday).
  if (a.def.population && b.def.population && a.def.population !== b.def.population) {
    downgrade('partial', `Population base differs: ${a.def.population} vs. ${b.def.population}.`);
  }

  // Survey-year gap.
  const yearGap = Math.abs(a.value.year - b.value.year);
  if (yearGap >= YEAR_NONE_GAP) {
    downgrade('none', `Survey years ${yearGap} years apart (${a.value.year} vs ${b.value.year}).`);
  } else if (yearGap >= YEAR_PARTIAL_GAP) {
    downgrade('partial', `Survey years ${yearGap} years apart (${a.value.year} vs ${b.value.year}).`);
  }

  return { level, notes };
}

/**
 * Assess comparability across a set of metrics (>= 2) for one indicator.
 * The overall level is the worst pairwise level; notes are de-duplicated.
 */
export function assessSet(
  metrics: Array<ResolvedMetric & { status: 'sourced' }>,
): ComparabilityAssessment {
  const notes = new Set<string>();
  let level: Comparability = 'full';
  const worse = (a: Comparability, b: Comparability): Comparability =>
    a === 'none' || b === 'none' ? 'none' : a === 'partial' || b === 'partial' ? 'partial' : 'full';

  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const pair = assessComparability(metrics[i]!, metrics[j]!);
      level = worse(level, pair.level);
      pair.notes.forEach((n) => notes.add(n));
    }
  }
  return { level, notes: [...notes] };
}

/** Group registry records by indicator, keeping only the requested cities. */
export function metricsByIndicator(
  records: MetricRecord[],
  indicatorId: string,
): MetricRecord[] {
  const indicator = INDICATOR_BY_ID.get(indicatorId);
  if (!indicator) return [];
  return records.filter((r) => r.indicatorId === indicatorId);
}
