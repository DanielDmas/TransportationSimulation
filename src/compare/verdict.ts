/**
 * Verdict engine — decides if the app may say "X is better", and suppresses it otherwise.
 *
 * A verdict renders only when:
 *   1. every referenced metric is SOURCED (not PENDING), and
 *   2. the indicator allows a verdict (descriptive indicators never do), and
 *   3. the cities are comparable (assessed set level is not 'none').
 * Otherwise it is suppressed with a reason. If comparable but values effectively tie,
 * it reports 'no-clear-leader' rather than manufacturing a winner.
 *
 * This is the editorial-neutrality contract expressed in code (docs/EDITORIAL_POLICY.md).
 */

import { INDICATOR_BY_ID } from './dimensions';
import { assessSet } from './normalize';
import { resolveMetric } from '../contract/validate';
import type {
  City,
  MetricRecord,
  ResolvedMetric,
  VerdictCityValue,
  VerdictDefinition,
  VerdictResult,
} from '../contract/schema';

/** Relative gap below which two values are treated as a tie. */
const TIE_EPSILON = 0.02;

function isTie(sorted: VerdictCityValue[]): boolean {
  if (sorted.length < 2) return false;
  const top = sorted[0]!.value;
  const next = sorted[1]!.value;
  const scale = Math.max(Math.abs(top), Math.abs(next), 1e-9);
  return Math.abs(top - next) / scale < TIE_EPSILON;
}

export function evaluateVerdict(
  def: VerdictDefinition,
  records: MetricRecord[],
): VerdictResult {
  const byId = new Map(records.map((r) => [r.metricId, r]));
  const indicator = def.metricIds
    .map((id) => byId.get(id))
    .map((r) => (r ? INDICATOR_BY_ID.get(r.indicatorId) : undefined))
    .find(Boolean);

  // Guard: indicators flagged descriptive may never yield a verdict.
  if (indicator && !indicator.allowsVerdict) {
    return {
      status: 'suppressed',
      def,
      reason: 'incomparable',
      detail: `Indicator "${indicator.label}" is descriptive; no "better" verdict allowed.`,
    };
  }

  // Resolve every referenced metric; any pending → suppress.
  const resolved: Array<ResolvedMetric & { status: 'sourced' }> = [];
  for (const id of def.metricIds) {
    const rec = byId.get(id);
    if (!rec) {
      return { status: 'suppressed', def, reason: 'pending', detail: `Missing metric ${id}.` };
    }
    const r = resolveMetric(rec);
    if (r.status === 'pending') {
      return {
        status: 'suppressed',
        def,
        reason: 'pending',
        detail: `Awaiting sourced data for ${id}.`,
      };
    }
    resolved.push(r);
  }

  // Comparability gate.
  const comparability = assessSet(resolved);
  if (comparability.level === 'none') {
    return {
      status: 'suppressed',
      def,
      reason: 'incomparable',
      detail: comparability.notes.join(' '),
    };
  }

  // Rank cities by the criterion direction.
  const cityValues: VerdictCityValue[] = resolved.map((r) => ({
    city: r.def.city,
    value: r.value.value,
    unit: r.def.unit,
  }));
  const ranking = [...cityValues].sort((x, y) =>
    def.direction === 'higher-better' ? y.value - x.value : x.value - y.value,
  );

  if (isTie(ranking)) {
    return {
      status: 'no-clear-leader',
      def,
      ranking,
      comparability: comparability.level,
      comparabilityNotes: comparability.notes,
    };
  }

  return {
    status: 'rendered',
    def,
    leader: ranking[0]!.city,
    ranking,
    comparability: comparability.level,
    comparabilityNotes: comparability.notes,
  };
}

export function evaluateAll(
  verdicts: VerdictDefinition[],
  records: MetricRecord[],
): VerdictResult[] {
  return verdicts.map((v) => evaluateVerdict(v, records));
}

/** Cities that appear as a candidate leader across the verdict catalog, per dimension. */
export function candidateLeaderCoverage(
  verdicts: VerdictDefinition[],
): Map<City, Set<string>> {
  const coverage = new Map<City, Set<string>>();
  for (const v of verdicts) {
    for (const c of v.cities) {
      if (!coverage.has(c)) coverage.set(c, new Set());
      coverage.get(c)!.add(v.dimension);
    }
  }
  return coverage;
}
