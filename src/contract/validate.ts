/**
 * Reality Contract — runtime guards and the resolve gate.
 *
 * `resolveMetric` is the ONLY sanctioned way UI code turns a registry record into a
 * displayable number. It returns a discriminated union, so there is no code path that
 * reads `.value` off a PENDING metric. This is layer 2 of the data-first gate
 * (type-level + runtime + build-time; see docs/PLAN.md §7).
 */

import {
  PENDING,
  type MetricRecord,
  type ResolvedMetric,
  type SourcedValue,
  type VerdictDefinition,
} from './schema';

export function isPending(record: MetricRecord): boolean {
  return record.value === PENDING;
}

export function isSourced(
  record: MetricRecord,
): record is MetricRecord & { value: SourcedValue } {
  return record.value !== PENDING;
}

/** The gate: convert a record into something safe to display. */
export function resolveMetric(record: MetricRecord): ResolvedMetric {
  const { value, ...def } = record;
  if (value === PENDING) {
    return { status: 'pending', def };
  }
  return { status: 'sourced', def, value };
}

/** Structural problems found while validating the registry (used by CI). */
export interface RegistryIssue {
  metricId: string;
  problem: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate a set of metric records. Enforces that every record has an id/geography/
 * definition, that ids are unique, and that any *sourced* value carries complete,
 * well-formed provenance. A PENDING metric is valid (that is the point) — but a
 * half-filled sourced value is not.
 */
export function validateRegistry(records: MetricRecord[]): RegistryIssue[] {
  const issues: RegistryIssue[] = [];
  const seen = new Set<string>();

  for (const r of records) {
    const push = (problem: string) => issues.push({ metricId: r.metricId, problem });

    if (!r.metricId) push('missing metricId');
    if (seen.has(r.metricId)) push('duplicate metricId');
    seen.add(r.metricId);

    if (!r.geography) push('missing geography (exact boundary required)');
    if (!r.definition) push('missing definition');
    if (!r.indicatorId) push('missing indicatorId');
    if (!r.unit) push('missing unit');

    if (r.value !== PENDING) {
      const v = r.value;
      if (typeof v.value !== 'number' || Number.isNaN(v.value)) {
        push('sourced value is not a number');
      }
      if (!v.source || !v.sourceUrl) push('sourced value missing source/sourceUrl');
      if (!v.methodology) push('sourced value missing methodology');
      if (!Number.isInteger(v.year)) push('sourced value missing/invalid year');
      if (!ISO_DATE.test(v.retrievedDate)) push('sourced value missing/invalid retrievedDate');
      if (!ISO_DATE.test(v.lastVerified)) push('sourced value missing/invalid lastVerified');
      if (![1, 2, 3, 4].includes(v.tier)) push('sourced value has invalid tier');
    }
  }

  return issues;
}

/**
 * Validate verdict definitions against the metric registry. A verdict must reference
 * >= 2 cities, carry a non-empty caveat (neutrality guard), and every metricId it
 * cites must exist in the registry. Whether it may *render* is a runtime question
 * (see compare/verdict.ts); this only checks it is well-formed.
 */
export function validateVerdicts(
  verdicts: VerdictDefinition[],
  records: MetricRecord[],
): RegistryIssue[] {
  const issues: RegistryIssue[] = [];
  const byId = new Map(records.map((r) => [r.metricId, r]));

  for (const v of verdicts) {
    const push = (problem: string) => issues.push({ metricId: v.verdictId, problem });

    if (v.cities.length < 2) push('verdict compares fewer than 2 cities');
    if (v.metricIds.length !== v.cities.length) {
      push('verdict must reference exactly one metric per city');
    }
    if (!v.caveat || v.caveat.trim().length === 0) {
      push('verdict missing caveat (required by editorial policy)');
    }
    for (const id of v.metricIds) {
      if (!byId.has(id)) push(`verdict references unknown metric ${id}`);
    }
  }

  return issues;
}
