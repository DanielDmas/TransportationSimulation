/**
 * Templated explainer — the MVP implementation of the Explainer interface.
 * Pure string assembly from structured inputs; no numbers are invented.
 */

import { SCORE_LABELS, type Policy, type ScoreId } from '../model/types';
import type { Explainer, Explanation } from './Explainer';
import type { VerdictResult } from '../contract/schema';

function titleCase(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

export const templatedExplainer: Explainer = {
  explainVerdict(result: VerdictResult): Explanation {
    if (result.status === 'suppressed') {
      const reason =
        result.reason === 'pending'
          ? 'This comparison is waiting on sourced data, so no "better" claim is made yet.'
          : 'These figures are not directly comparable, so no "better" claim is made.';
      return {
        headline: `No verdict on ${result.def.claim}`,
        detail: `${reason} ${result.detail}`.trim(),
        caveats: ['Difference may be shown without a "better" label once data is available.'],
      };
    }

    if (result.status === 'no-clear-leader') {
      return {
        headline: `Comparable — no clear leader on ${result.def.claim}`,
        detail:
          `The cities are close enough on ${result.def.claim} that the data does not support ` +
          `naming a leader.`,
        caveats: [result.def.caveat, ...result.comparabilityNotes],
      };
    }

    const [top, ...rest] = result.ranking;
    const trailing = rest.map((r) => `${titleCase(r.city)} ${r.value}${unitSuffix(r.unit)}`).join(', ');
    return {
      headline: `${titleCase(result.leader)} leads on ${result.def.claim}`,
      detail:
        `By the criterion "${result.def.criterion}", ${titleCase(result.leader)} leads at ` +
        `${top!.value}${unitSuffix(top!.unit)} (vs. ${trailing}).`,
      caveats: [
        result.def.caveat,
        ...(result.comparability === 'partial'
          ? ['Comparison is only partial: ' + result.comparabilityNotes.join(' ')]
          : []),
      ],
    };
  },

  explainPolicyRun(policies: Policy[], deltas: Partial<Record<ScoreId, number>>): Explanation {
    const improved: string[] = [];
    const worsened: string[] = [];
    for (const [id, d] of Object.entries(deltas) as [ScoreId, number][]) {
      if (d > 0) improved.push(SCORE_LABELS[id]);
      else if (d < 0) worsened.push(SCORE_LABELS[id]);
    }
    const names = policies.map((p) => p.label).join(', ');
    return {
      headline: names ? `Effect of: ${names}` : 'No policies selected',
      detail:
        (improved.length ? `Improves ${improved.join(', ')}. ` : '') +
        (worsened.length ? `Worsens ${worsened.join(', ')}.` : ''),
      caveats: [
        'Directions are illustrative, not calibrated predictions.',
        'Magnitudes are not empirical — see docs/MODEL.md.',
      ],
    };
  },
};

function unitSuffix(unit: string): string {
  return unit.startsWith('%') ? '%' : ` ${unit}`;
}
