import { describe, it, expect } from 'vitest';
import { REGISTRY, VERDICTS } from './index';
import { ACTIVE_CITIES } from './geography';
import { validateRegistry, validateVerdicts } from '../validate';
import { evaluateAll, candidateLeaderCoverage } from '../../compare/verdict';
import { INDICATORS } from '../../compare/dimensions';
import { DIMENSIONS } from '../schema';

describe('registry integrity', () => {
  it('validates with no structural issues', () => {
    expect(validateRegistry(REGISTRY)).toEqual([]);
  });

  it('has one record per active city per indicator', () => {
    expect(REGISTRY.length).toBe(ACTIVE_CITIES.length * INDICATORS.length);
  });

  it('every metric is currently PENDING (no data gathered yet)', () => {
    expect(REGISTRY.every((r) => r.value === 'PENDING')).toBe(true);
  });
});

describe('verdict catalog', () => {
  it('all verdicts are well-formed against the registry', () => {
    expect(validateVerdicts(VERDICTS, REGISTRY)).toEqual([]);
  });

  it('every verdict currently SUPPRESSES (data-first gate holds end-to-end)', () => {
    const results = evaluateAll(VERDICTS, REGISTRY);
    expect(results.every((r) => r.status === 'suppressed')).toBe(true);
  });

  it('coverage is symmetric: Prague is a candidate leader across multiple dimensions', () => {
    const coverage = candidateLeaderCoverage(VERDICTS);
    const pragueDims = coverage.get('prague');
    expect(pragueDims).toBeDefined();
    // Prague must be eligible to lead in at least two dimensions, same as the others.
    expect(pragueDims!.size).toBeGreaterThanOrEqual(2);
    for (const city of ACTIVE_CITIES) {
      expect(coverage.get(city)!.size).toBe(pragueDims!.size);
    }
  });

  it('covers most comparison dimensions (not just cycling)', () => {
    const dims = new Set(VERDICTS.map((v) => v.dimension));
    // At least mobility, cycling, pedestrian, planning are represented.
    const expected = DIMENSIONS.filter((d) => d !== 'socioeconomic');
    for (const d of expected) expect(dims.has(d)).toBe(true);
  });
});
