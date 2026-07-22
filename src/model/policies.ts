/**
 * Policy deck (SECONDARY sandbox). Each card encodes a trade-off: at least one score
 * improves and at least one worsens (enforced by test). Effects are illustrative
 * directions from the design notes — not calibrated magnitudes.
 */

import type { Policy } from './types';

export const POLICIES: Policy[] = [
  {
    id: 'transit_investment',
    label: 'Expand transit (metro/tram/rail)',
    cityScope: [],
    effects: { carDependence: 0.6, accessibility: 0.5, climate: 0.4, affordability: -0.4, streetQuality: -0.2 },
    note: 'Improves reach and lowers car reliance, but is capital-intensive and disruptive to build.',
  },
  {
    id: 'parking_reform',
    label: 'Raise parking price / cut supply',
    cityScope: [],
    effects: { carDependence: 0.5, streetQuality: 0.5, climate: 0.3, safety: 0.2, affordability: -0.4 },
    note: 'Reduces cruising and reclaims space, but raises costs for those who must drive.',
  },
  {
    id: 'protected_cycle_network',
    label: 'Build protected cycle network',
    cityScope: [],
    effects: { carDependence: 0.4, safety: 0.5, climate: 0.3, streetQuality: 0.3, accessibility: -0.2 },
    note: 'Boosts safe cycling; initial street-space reallocation can cut car throughput.',
  },
  {
    id: 'low_speed_zones',
    label: '30 km/h zones',
    cityScope: [],
    effects: { safety: 0.6, streetQuality: 0.4, accessibility: -0.3 },
    note: 'Fewer/less-severe crashes and calmer streets; slower motor traffic.',
  },
  {
    id: 'park_and_ride',
    label: 'Park-and-ride at the edge',
    cityScope: [],
    effects: { carDependence: 0.3, accessibility: 0.4, streetQuality: 0.3, climate: 0.2, affordability: -0.3 },
    note: 'Intercepts commuter cars before the core, at real land/infrastructure cost.',
  },
  {
    id: 'road_capacity',
    label: 'Add road capacity',
    cityScope: [],
    effects: { accessibility: 0.4, carDependence: -0.5, climate: -0.4, streetQuality: -0.3, safety: -0.2 },
    note: 'Eases congestion short-term but induces demand and entrenches car dependence.',
  },
  {
    id: 'road_pricing',
    label: 'Congestion / road pricing',
    cityScope: [],
    effects: { carDependence: 0.4, climate: 0.4, streetQuality: 0.3, accessibility: 0.1, affordability: -0.5 },
    note: 'Cuts car traffic and funds alternatives, but is a direct cost to drivers.',
  },
  {
    id: 'suburban_rail_frequency',
    label: 'Increase suburban rail frequency',
    cityScope: ['prague', 'vienna'],
    effects: { carDependence: 0.5, accessibility: 0.5, climate: 0.3, affordability: -0.3 },
    note: 'Targets metropolitan-edge car dependence; ongoing operating cost.',
  },
];

export function policiesFor(city: string): Policy[] {
  return POLICIES.filter((p) => p.cityScope.length === 0 || p.cityScope.includes(city as never));
}
