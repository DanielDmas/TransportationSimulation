/**
 * The primary geographic boundary chosen for each city (see docs/DATA_NEEDS.md §B0).
 * Fixing one primary boundary per city is what keeps cross-city metrics honest.
 * Prague-city is deliberately the administrative city — never Czechia-country.
 */

import type { City } from '../schema';

export const PRIMARY_GEOGRAPHY: Record<City, string> = {
  prague: 'Prague administrative city (hl. m. Praha)',
  vienna: 'Vienna administrative city (Gemeinde Wien)',
  amsterdam: 'Amsterdam municipality (Gemeente Amsterdam)',
  paris: 'Paris — boundary TBD (Ville de Paris vs. Métropole du Grand Paris)',
};

/** Cities included in the first build (Paris is defined but not yet populated). */
export const ACTIVE_CITIES: City[] = ['prague', 'vienna', 'amsterdam'];
