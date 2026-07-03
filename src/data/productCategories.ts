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

/** Base metrics + count units. */
export const PRODUCT_UNITS = ['lb', 'g', 'kg', 'ml', 'L', 'ea', 'pc', 'pk'];

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
