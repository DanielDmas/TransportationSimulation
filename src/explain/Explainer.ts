/**
 * Explanation layer interface.
 *
 * Explanations sit at the END of the pipeline: they narrate model/engine outputs and
 * registry facts, and must NEVER compute or invent numbers. The templated implementation
 * ships now; a Claude-backed implementation can be dropped in later behind this same
 * interface (docs/PLAN.md Phase 5) with no change to callers.
 */

import type { VerdictResult } from '../contract/schema';
import type { Policy, ScoreId } from '../model/types';

export interface Explanation {
  headline: string;
  detail: string;
  /** Provenance/uncertainty caveats the UI must show alongside the text. */
  caveats: string[];
}

export interface Explainer {
  /** Explain a single verdict result (rendered, tie, or suppressed). */
  explainVerdict(result: VerdictResult): Explanation;
  /** Explain the effect of a policy selection given the resulting score deltas. */
  explainPolicyRun(policies: Policy[], deltas: Partial<Record<ScoreId, number>>): Explanation;
}
