import { describe, it, expect } from 'vitest';
import { PENDING, type MetricRecord, type SourcedValue, type VerdictDefinition } from '../contract/schema';
import { evaluateVerdict } from './verdict';

function rec(
  city: MetricRecord['city'],
  indicatorId: string,
  value: number | typeof PENDING,
  extra: Partial<MetricRecord> = {},
): MetricRecord {
  const sv: SourcedValue = {
    value: typeof value === 'number' ? value : 0,
    year: 2023,
    source: 's',
    sourceUrl: 'https://x',
    tier: 1,
    methodology: 'm',
    confidence: 'high',
    retrievedDate: '2026-07-23',
    lastVerified: '2026-07-23',
  };
  return {
    metricId: `${city}_${indicatorId}`,
    city,
    dimension: 'cycling',
    indicatorId,
    unit: '% of trips',
    geography: `${city} administrative city`,
    definition: 'x',
    tripBasis: 'trip',
    population: 'resident',
    intendedSource: 'x',
    value: value === PENDING ? PENDING : sv,
    ...extra,
  };
}

const bikeVerdict: VerdictDefinition = {
  verdictId: 'v_bike',
  dimension: 'cycling',
  claim: 'cycling modal share',
  criterion: 'higher bike share is better',
  direction: 'higher-better',
  cities: ['amsterdam', 'vienna', 'prague'],
  metricIds: ['amsterdam_modal_share_bike', 'vienna_modal_share_bike', 'prague_modal_share_bike'],
  caveat: 'culture and terrain matter too',
};

describe('evaluateVerdict — the neutrality gate', () => {
  it('SUPPRESSES while any metric is pending (proves data-first gate)', () => {
    const records = [
      rec('amsterdam', 'modal_share_bike', 36),
      rec('vienna', 'modal_share_bike', 11),
      rec('prague', 'modal_share_bike', PENDING),
    ];
    const r = evaluateVerdict(bikeVerdict, records);
    expect(r.status).toBe('suppressed');
    if (r.status === 'suppressed') expect(r.reason).toBe('pending');
  });

  it('RENDERS a leader when all are sourced and comparable (higher-better)', () => {
    const records = [
      rec('amsterdam', 'modal_share_bike', 36),
      rec('vienna', 'modal_share_bike', 11),
      rec('prague', 'modal_share_bike', 7),
    ];
    const r = evaluateVerdict(bikeVerdict, records);
    expect(r.status).toBe('rendered');
    if (r.status === 'rendered') {
      expect(r.leader).toBe('amsterdam');
      expect(r.ranking[0]!.city).toBe('amsterdam');
      expect(r.ranking.at(-1)!.city).toBe('prague');
    }
  });

  it('respects lower-better direction (car share): lowest wins', () => {
    const carVerdict: VerdictDefinition = {
      ...bikeVerdict,
      verdictId: 'v_car',
      direction: 'lower-better',
      claim: 'car modal share',
      metricIds: ['amsterdam_modal_share_car', 'vienna_modal_share_car', 'prague_modal_share_car'],
    };
    const records = [
      rec('amsterdam', 'modal_share_car', 20),
      rec('vienna', 'modal_share_car', 25),
      rec('prague', 'modal_share_car', 33),
    ];
    const r = evaluateVerdict(carVerdict, records);
    expect(r.status).toBe('rendered');
    if (r.status === 'rendered') expect(r.leader).toBe('amsterdam');
  });

  it('SUPPRESSES as incomparable when a city uses country geography', () => {
    const records = [
      rec('amsterdam', 'modal_share_bike', 36),
      rec('vienna', 'modal_share_bike', 11),
      rec('prague', 'modal_share_bike', 7, { geography: 'Czechia (country)' }),
    ];
    const r = evaluateVerdict(bikeVerdict, records);
    expect(r.status).toBe('suppressed');
    if (r.status === 'suppressed') expect(r.reason).toBe('incomparable');
  });

  it('reports no-clear-leader when the top two effectively tie', () => {
    const records = [
      rec('amsterdam', 'modal_share_bike', 36),
      rec('vienna', 'modal_share_bike', 35.9),
      rec('prague', 'modal_share_bike', 7),
    ];
    const r = evaluateVerdict(bikeVerdict, records);
    expect(r.status).toBe('no-clear-leader');
  });

  it('SUPPRESSES for a descriptive (socioeconomic) indicator even if sourced', () => {
    const descriptiveVerdict: VerdictDefinition = {
      ...bikeVerdict,
      verdictId: 'v_desc',
      dimension: 'socioeconomic',
      metricIds: [
        'amsterdam_car_access_lowest_income',
        'vienna_car_access_lowest_income',
        'prague_car_access_lowest_income',
      ],
    };
    const records = [
      rec('amsterdam', 'car_access_lowest_income', 20, { dimension: 'socioeconomic' }),
      rec('vienna', 'car_access_lowest_income', 30, { dimension: 'socioeconomic' }),
      rec('prague', 'car_access_lowest_income', 40, { dimension: 'socioeconomic' }),
    ];
    const r = evaluateVerdict(descriptiveVerdict, records);
    expect(r.status).toBe('suppressed');
  });
});
