/**
 * Policy what-if sandbox — types (SECONDARY feature; scoped after the explorer).
 *
 * IMPORTANT: this module is deliberately NOT a calibrated predictive model. Policy
 * effects below are authored *directions* (which score goes up, which goes down),
 * drawn from the design notes, expressed on an illustrative [-1, 1] scale. Magnitudes
 * are not empirical and must never be presented as predictions. Real elasticities and
 * a calibrated baseline are a later phase (docs/MODEL.md), gated by real data.
 */

import type { City } from '../contract/schema';

/** The six trade-off axes. Each score is 0..100 where 100 = best outcome on that axis. */
export const SCORE_IDS = [
  'carDependence', // 100 = least car-dependent
  'accessibility',
  'safety',
  'streetQuality',
  'climate', // 100 = lowest transport emissions
  'affordability',
] as const;
export type ScoreId = (typeof SCORE_IDS)[number];

export type Scores = Record<ScoreId, number>;

export const SCORE_LABELS: Record<ScoreId, string> = {
  carDependence: 'Car dependence',
  accessibility: 'Accessibility',
  safety: 'Safety',
  streetQuality: 'Street quality',
  climate: 'Climate impact',
  affordability: 'Affordability',
};

/** A policy card. `effects` are authored directions on the illustrative scale. */
export interface Policy {
  id: string;
  label: string;
  /** Cities this card is offered for; empty = all. */
  cityScope: City[];
  /** Partial map of illustrative effects in [-1, 1]. Positive = improves that score. */
  effects: Partial<Record<ScoreId, number>>;
  /** One-line rationale for the trade-off (shown to the user). */
  note: string;
}
