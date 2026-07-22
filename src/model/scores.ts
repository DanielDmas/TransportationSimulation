/**
 * Deterministic score application (SECONDARY sandbox).
 *
 * Pure and deterministic: same baseline + same policies → same scores, always.
 * `applyPolicies` sums authored effects onto a baseline and clamps to [0, 100].
 * The baseline itself must come from real data later; NEUTRAL_BASELINE is a labeled
 * placeholder used only for demonstration and tests, never shown as a real city score.
 */

import { SCORE_IDS, type Policy, type ScoreId, type Scores } from './types';

/** Placeholder baseline (all axes at the midpoint). NOT a real city measurement. */
export const NEUTRAL_BASELINE: Scores = Object.fromEntries(
  SCORE_IDS.map((id) => [id, 50]),
) as Scores;

/** How strongly one unit of illustrative effect moves a 0..100 score. */
const EFFECT_SCALE = 20;

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

/** Apply a set of policies to a baseline. Order-independent (effects are summed). */
export function applyPolicies(baseline: Scores, policies: Policy[]): Scores {
  const out: Scores = { ...baseline };
  for (const policy of policies) {
    for (const id of SCORE_IDS) {
      const delta = policy.effects[id];
      if (delta !== undefined) {
        out[id] = clamp(out[id] + delta * EFFECT_SCALE);
      }
    }
  }
  for (const id of SCORE_IDS) out[id] = clamp(out[id]);
  return out;
}

/** Net signed change per score from a policy set (before clamping). Used for explanations. */
export function scoreDeltas(policies: Policy[]): Partial<Record<ScoreId, number>> {
  const deltas: Partial<Record<ScoreId, number>> = {};
  for (const policy of policies) {
    for (const id of SCORE_IDS) {
      const d = policy.effects[id];
      if (d !== undefined) deltas[id] = (deltas[id] ?? 0) + d * EFFECT_SCALE;
    }
  }
  return deltas;
}
