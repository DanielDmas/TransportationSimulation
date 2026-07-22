import { describe, it, expect } from 'vitest';
import { PENDING, type MetricRecord, type SourcedValue } from './schema';
import { isPending, isSourced, resolveMetric, validateRegistry, validateVerdicts } from './validate';

const goodValue: SourcedValue = {
  value: 25,
  year: 2024,
  source: 'Stadt Wien',
  sourceUrl: 'https://example.org',
  tier: 1,
  methodology: 'resident survey',
  confidence: 'high',
  retrievedDate: '2026-07-23',
  lastVerified: '2026-07-23',
};

function record(partial: Partial<MetricRecord> = {}): MetricRecord {
  return {
    metricId: 'vienna_modal_share_car',
    city: 'vienna',
    dimension: 'mobility',
    indicatorId: 'modal_share_car',
    unit: '% of trips',
    geography: 'Vienna administrative city',
    definition: 'Car modal share (resident trips)',
    intendedSource: 'see docs/DATA_LINKS.md',
    value: PENDING,
    ...partial,
  };
}

describe('the data-first gate (resolveMetric)', () => {
  it('reports a pending metric as pending, exposing no number', () => {
    const r = resolveMetric(record());
    expect(r.status).toBe('pending');
    // The discriminated union means .value is not even present on the pending branch.
    expect('value' in r).toBe(false);
  });

  it('exposes the number only on the sourced branch', () => {
    const r = resolveMetric(record({ value: goodValue }));
    expect(r.status).toBe('sourced');
    if (r.status === 'sourced') expect(r.value.value).toBe(25);
  });

  it('isPending / isSourced agree with resolveMetric', () => {
    expect(isPending(record())).toBe(true);
    expect(isSourced(record({ value: goodValue }))).toBe(true);
  });
});

describe('validateRegistry', () => {
  it('accepts a PENDING metric as valid', () => {
    expect(validateRegistry([record()])).toEqual([]);
  });

  it('accepts a fully-formed sourced metric', () => {
    expect(validateRegistry([record({ value: goodValue })])).toEqual([]);
  });

  it('rejects a sourced value missing provenance', () => {
    const bad = { ...goodValue, source: '', methodology: '' };
    const issues = validateRegistry([record({ value: bad })]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.problem.includes('source'))).toBe(true);
  });

  it('rejects a bad retrievedDate and invalid tier', () => {
    const bad = { ...goodValue, retrievedDate: '23-07-2026', tier: 9 as unknown as 1 };
    const issues = validateRegistry([record({ value: bad })]);
    expect(issues.some((i) => i.problem.includes('retrievedDate'))).toBe(true);
    expect(issues.some((i) => i.problem.includes('tier'))).toBe(true);
  });

  it('flags duplicate metricIds', () => {
    const issues = validateRegistry([record(), record()]);
    expect(issues.some((i) => i.problem === 'duplicate metricId')).toBe(true);
  });
});

describe('validateVerdicts', () => {
  it('rejects a verdict with no caveat and an unknown metric', () => {
    const issues = validateVerdicts(
      [
        {
          verdictId: 'v_bad',
          dimension: 'cycling',
          claim: 'x',
          criterion: 'y',
          direction: 'higher-better',
          cities: ['vienna', 'prague'],
          metricIds: ['vienna_x', 'prague_x'],
          caveat: '',
        },
      ],
      [record()],
    );
    expect(issues.some((i) => i.problem.includes('caveat'))).toBe(true);
    expect(issues.some((i) => i.problem.includes('unknown metric'))).toBe(true);
  });
});
