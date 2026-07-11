/**
 * The 6 master product pillars. The `code` is the 2-letter SKU prefix and the
 * value stored on `products.category`. `label` is what admins see.
 *
 * Keep in sync with `convex/lib/productCategories.ts`.
 */
export const PRODUCT_CATEGORIES = [
  { code: 'FP', label: 'Food Pantry' },
  { code: 'GP', label: 'Ground Provisions & Fresh' },
  { code: 'SN', label: 'Snacks & Beverages' },
  { code: 'FR', label: 'Fresh Chilled' },
  { code: 'BK', label: 'Bakery' },
  { code: 'HK', label: 'Home & Kitchen' },
] as const;

/** Only this pillar uses the retail attribute set; the rest use dietary. */
export const HOME_CATEGORY_CODE = 'HK';

/** Base metrics + count units (the full set). */
export const PRODUCT_UNITS = ['lb', 'g', 'kg', 'ml', 'L', 'ea', 'pc', 'pk'];

/**
 * Which units make sense per pillar, so the admin only sees relevant options.
 * Household / personal-care (HK) items aren't sold by lb/g/kg; bakery is
 * count-based; fresh & pantry lean on weight. Falls back to the full list
 * for any code not listed here.
 */
export const CATEGORY_UNITS: Record<string, string[]> = {
  FP: ['g', 'kg', 'ml', 'L', 'ea', 'pk'], // dry goods, oils, sauces
  GP: ['lb', 'kg', 'g', 'ea', 'pk'],      // roots, tubers, produce — by weight
  SN: ['g', 'ml', 'L', 'ea', 'pk'],       // snacks, teas, juices
  FR: ['lb', 'kg', 'g', 'ea', 'pk'],      // meat, seafood, dairy, eggs
  BK: ['ea', 'pk', 'pc'],                 // loaves & pastries — by count
  HK: ['ea', 'pc', 'pk', 'ml', 'L'],      // cookware, tools, liquid refills
};

/** Units to offer for a given category (full list when unknown/empty). */
export function unitsForCategory(code: string): string[] {
  return CATEGORY_UNITS[code] ?? PRODUCT_UNITS;
}

export const PURCHASE_TYPES = [
  { value: 'one-time', label: 'One-time' },
  { value: 'subscription', label: 'Subscription / Refill swap' },
  { value: 'deposit', label: 'Deposit-based (refundable container)' },
];

/** Food & pantry dietary flags. */
export const FOOD_ATTRIBUTES = [
  'organic',
  'local',
  'glutenFree',
  'dairyFree',
  'vegan',
  'nutFree',
] as const;

/** Home, kitchen & retail flags. */
export const HOME_ATTRIBUTES = [
  'sustainableMaterial',
  'reusable',
  'plasticFree',
  'foodSafe',
  'upcycled',
] as const;

/** Human labels for attribute keys. */
export const ATTRIBUTE_LABELS: Record<string, string> = {
  organic: 'Organic',
  local: 'Local',
  glutenFree: 'Gluten-free',
  dairyFree: 'Dairy-free',
  vegan: 'Vegan',
  nutFree: 'Nut-free',
  sustainableMaterial: 'Sustainable material',
  reusable: 'Reusable',
  plasticFree: 'Plastic-free',
  foodSafe: 'Food-safe / non-toxic',
  upcycled: 'Circular / upcycled',
};

export function categoryLabel(code: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.code === code)?.label ?? code;
}

export function isHomeCategory(code: string): boolean {
  return code === HOME_CATEGORY_CODE;
}
