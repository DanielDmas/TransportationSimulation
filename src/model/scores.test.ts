import { describe, it, expect } from 'vitest';
import { applyPolicies, scoreDeltas, NEUTRAL_BASELINE } from './scores';
import { POLICIES } from './policies';
import { SCORE_IDS, type ScoreId } from './types';

describe('applyPolicies (deterministic sandbox)', () => {
  it('is deterministic: same inputs → same outputs', () => {
    const a = applyPolicies(NEUTRAL_BASELINE, [POLICIES[0]!, POLICIES[1]!]);
    const b = applyPolicies(NEUTRAL_BASELINE, [POLICIES[0]!, POLICIES[1]!]);
    expect(a).toEqual(b);
  });

  it('is order-independent (effects are summed)', () => {
    const a = applyPolicies(NEUTRAL_BASELINE, [POLICIES[0]!, POLICIES[2]!]);
    const b = applyPolicies(NEUTRAL_BASELINE, [POLICIES[2]!, POLICIES[0]!]);
    expect(a).toEqual(b);
  });

  it('keeps every score within [0, 100]', () => {
    const scores = applyPolicies(NEUTRAL_BASELINE, POLICIES);
    for (const id of SCORE_IDS) {
      expect(scores[id]).toBeGreaterThanOrEqual(0);
      expect(scores[id]).toBeLessThanOrEqual(100);
    }
  });
});

describe('trade-off invariant', () => {
  it('every policy improves at least one score and worsens at least one', () => {
    for (const p of POLICIES) {
      const values = Object.values(p.effects);
      expect(values.some((v) => v! > 0)).toBe(true);
      expect(values.some((v) => v! < 0)).toBe(true);
    }
  });

  it('scoreDeltas reflects the summed direction per score', () => {
    const deltas = scoreDeltas([POLICIES.find((p) => p.id === 'road_capacity')!]);
    // Road capacity worsens car dependence and climate, improves accessibility.
    expect((deltas.carDependence as number)).toBeLessThan(0);
    expect((deltas.accessibility as number)).toBeGreaterThan(0);
  });
});

describe('effect ids are valid score ids', () => {
  it('no policy references an unknown score', () => {
    const valid = new Set<string>(SCORE_IDS);
    for (const p of POLICIES) {
      for (const id of Object.keys(p.effects)) expect(valid.has(id as ScoreId)).toBe(true);
    }
  });
});
