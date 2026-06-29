/**
 * Server-side copy of the Trinidad & Tobago delivery regions, used to enforce
 * the "T&T only" restriction inside mutations (the UI can be bypassed; this
 * can't). Keep in sync with `src/data/ttRegions.ts`.
 */
export const TT_REGIONS = [
  "Port of Spain",
  "San Fernando",
  "Arima",
  "Chaguanas",
  "Point Fortin",
  "Couva-Tabaquite-Talparo",
  "Diego Martin",
  "Penal-Debe",
  "Princes Town",
  "Rio Claro-Mayaro",
  "San Juan-Laventille",
  "Sangre Grande",
  "Siparia",
  "Tunapuna-Piarco",
  "Tobago",
];

export const TT_COUNTRY_CODE = "TT";

export function isValidTTRegion(region: string): boolean {
  return TT_REGIONS.includes(region);
}
