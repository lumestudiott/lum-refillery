/**
 * Trinidad & Tobago is the only delivery territory. These are the 14 regional
 * corporations / municipalities used as the "region" for every address.
 *
 * NOTE: keep this in sync with `convex/lib/regions.ts` (the server-side copy
 * used to enforce the same restriction in mutations).
 */
export const TT_REGIONS = [
  'Port of Spain',
  'San Fernando',
  'Arima',
  'Chaguanas',
  'Point Fortin',
  'Couva-Tabaquite-Talparo',
  'Diego Martin',
  'Penal-Debe',
  'Princes Town',
  'Rio Claro-Mayaro',
  'San Juan-Laventille',
  'Sangre Grande',
  'Siparia',
  'Tunapuna-Piarco',
  'Tobago',
] as const;

export const TT_COUNTRY_CODE = 'TT';
export const TT_COUNTRY_NAME = 'Trinidad & Tobago';

export function isValidTTRegion(region: string): boolean {
  return (TT_REGIONS as readonly string[]).includes(region);
}
