import { describe, it, expect } from 'vitest';
import { resolveMetric } from '../contract/validate';
import type { MetricRecord, ResolvedMetric, SourcedValue } from '../contract/schema';
import { assessComparability, assessSet } from './normalize';

function sourced(
  city: MetricRecord['city'],
  overrides: Partial<MetricRecord> & { val: number; year: number },
): ResolvedMetric & { status: 'sourced' } {
  const value: SourcedValue = {
    value: overrides.val,
    year: overrides.year,
    source: 's',
    sourceUrl: 'https://x',
    tier: 1,
    methodology: 'm',
    confidence: 'high',
    retrievedDate: '2026-07-23',
    lastVerified: '2026-07-23',
  };
  const rec: MetricRecord = {
    metricId: `${city}_modal_share_car`,
    city,
    dimension: 'mobility',
    indicatorId: 'modal_share_car',
    unit: '% of trips',
    geography: 'Prague administrative city',
    definition: 'Car modal share',
    tripBasis: 'trip',
    population: 'resident',
    intendedSource: 'x',
    ...overrides,
    value,
  };
  const r = resolveMetric(rec);
  if (r.status !== 'sourced') throw new Error('expected sourced');
  return r;
}

describe('assessComparability', () => {
  it('is full when boundary, basis, population, and year align', () => {
    const a = sourced('prague', { val: 33, year: 2023, geography: 'Prague administrative city' });
    const b = sourced('vienna', { val: 25, year: 2024, geography: 'Vienna administrative city' });
    expect(assessComparability(a, b).level).toBe('full');
  });

  it('is NONE for city vs. country (the Prague-city vs Czechia-country trap)', () => {
    const a = sourced('prague', { val: 33, year: 2023, geography: 'Prague administrative city' });
    const b = sourced('vienna', { val: 82, year: 2023, geography: 'Czechia (country)' });
    expect(assessComparability(a, b).level).toBe('none');
  });

  it('is partial for city vs. metro boundary', () => {
    const a = sourced('prague', { val: 33, year: 2023, geography: 'Prague administrative city' });
    const b = sourced('vienna', { val: 40, year: 2023, geography: 'Vienna functional urban area' });
    expect(assessComparability(a, b).level).toBe('partial');
  });

  it('is partial when trip basis differs', () => {
    const a = sourced('prague', { val: 33, year: 2023, tripBasis: 'trip' });
    const b = sourced('vienna', { val: 25, year: 2023, tripBasis: 'stage' });
    expect(assessComparability(a, b).level).toBe('partial');
  });

  it('is partial for a 3-7 year gap and none for >= 8 years', () => {
    const base = { geography: 'Prague administrative city' as const };
    expect(
      assessComparability(
        sourced('prague', { val: 33, year: 2017, ...base }),
        sourced('vienna', { val: 25, year: 2021, ...base }),
      ).level,
    ).toBe('partial');
    expect(
      assessComparability(
        sourced('prague', { val: 33, year: 2015, ...base }),
        sourced('vienna', { val: 25, year: 2024, ...base }),
      ).level,
    ).toBe('none');
  });
});

describe('assessSet', () => {
  it('takes the worst pairwise level', () => {
    const a = sourced('prague', { val: 33, year: 2023, geography: 'Prague administrative city' });
    const b = sourced('vienna', { val: 25, year: 2024, geography: 'Vienna administrative city' });
    const c = sourced('amsterdam', { val: 20, year: 2023, geography: 'Netherlands (country)' });
    expect(assessSet([a, b]).level).toBe('full');
    expect(assessSet([a, b, c]).level).toBe('none');
  });
});
