/**
 * Server-side copy of the product pillar prefixes, used to auto-generate SKUs.
 * Keep in sync with `src/data/productCategories.ts`.
 */
export const PRODUCT_CATEGORY_CODES = ["FP", "GP", "SN", "FR", "BK", "HK"];

/** Resolve a 2-letter SKU prefix from a category value. Falls back to "LR". */
export function skuPrefixForCategory(category: string): string {
  const upper = (category || "").toUpperCase();
  if (PRODUCT_CATEGORY_CODES.includes(upper)) return upper;
  // Legacy free-text categories (e.g. "pantry", "produce") → first 2 letters.
  const letters = upper.replace(/[^A-Z]/g, "");
  return letters.slice(0, 2) || "LR";
}
