/**
 * The 6 master product pillars. The `code` is the 2-letter SKU prefix and the
 * value stored on `products.category`. `label` is what admins see, and
 * `description` explains what belongs in each pillar.
 *
 * Keep in sync with `convex/lib/productCategories.ts`.
 */
export const PRODUCT_CATEGORIES = [
  {
    code: 'FP',
    label: 'Food Pantry',
    description: 'Dry goods, grains, baking staples, spices, oils, sauces & condiments.',
  },
  {
    code: 'GP',
    label: 'Ground Provisions & Fresh',
    description: 'Roots, tubers, local fresh produce & fruits.',
  },
  {
    code: 'SN',
    label: 'Snacks & Beverages',
    description: 'Prepared snacks, chips, packaged teas, juices & coffee.',
  },
  {
    code: 'FR',
    label: 'Fresh Chilled',
    description: 'Meats, seafood, dairy, eggs & anything needing refrigeration.',
  },
  {
    code: 'BK',
    label: 'Bakery',
    description: 'Fresh breads, artisanal loaves & baked goods.',
  },
  {
    code: 'HK',
    label: 'Home & Kitchen',
    description: 'Eco cleaning, cookware, pots, pans & zero-waste kitchen tools.',
  },
] as const;

/** Only this pillar uses the retail attribute set; the rest use dietary. */
export const HOME_CATEGORY_CODE = 'HK';

/** Base metrics + count units (the full set). */
export const PRODUCT_UNITS = ['lb', 'g', 'kg', 'ml', 'L', 'ea', 'pc', 'pk'];

/** Full names + what each unit is for, shown alongside the short code. */
export const UNIT_LABELS: Record<string, string> = {
  lb: 'Pound',
  g: 'Gram',
  kg: 'Kilogram',
  ml: 'Milliliter',
  L: 'Liter',
  ea: 'Each',
  pc: 'Piece',
  pk: 'Pack',
};

/**
 * Which units make sense per pillar, so the admin only sees relevant options.
 * Household / personal-care (HK) items aren't sold by lb/g/kg; bakery is
 * count-based; fresh & pantry lean on weight. Falls back to the full list
 * for any code not listed here.
 */
export const CATEGORY_UNITS: Record<string, string[]> = {
  FP: ['g', 'kg', 'ml', 'L', 'ea', 'pk'], // dry goods, oils, sauces
  GP: ['lb', 'kg', 'g', 'ea', 'pk'],      // roots, tubers, produce - by weight
  SN: ['g', 'ml', 'L', 'ea', 'pk'],       // snacks, teas, juices
  FR: ['lb', 'kg', 'g', 'ea', 'pk'],      // meat, seafood, dairy, eggs
  BK: ['ea', 'pk', 'pc'],                 // loaves & pastries - by count
  HK: ['ea', 'pc', 'pk', 'ml', 'L'],      // cookware, tools, liquid refills
};

/** Units to offer for a given category (full list when unknown/empty). */
export function unitsForCategory(code: string): string[] {
  return CATEGORY_UNITS[code] ?? PRODUCT_UNITS;
}

export const PURCHASE_TYPES = [
  {
    value: 'one-time',
    label: 'One-time',
    description: 'Bought once, no recurring schedule - the default for cookware & hardware.',
  },
  {
    value: 'subscription',
    label: 'Subscription',
    description: 'Recurring delivery on a schedule - pantry top-ups, dairy, fresh produce.',
  },
  {
    value: 'refill-swap',
    label: 'Refill Swap',
    description: 'Container swap or pouch exchange - bring the old one back, get a fresh refill.',
  },
  {
    value: 'deposit',
    label: 'Deposit-based (refundable container)',
    description: 'Adds a refundable container fee, returned when the jar/bottle/tote comes back.',
  },
];

export const DISCOUNT_TIERS = [
  { value: 'tier0', label: 'Tier 0 (None)', percent: 0 },
  { value: 'tier1', label: 'Tier 1 (Introductory Promo: 5%)', percent: 5 },
  { value: 'tier2', label: 'Tier 2 (Bulk/Club: 10%)', percent: 10 },
  { value: 'tier3', label: 'Tier 3 (Subscription Loyalty: 12.5%)', percent: 12.5 },
];

export const UNIT_TYPES = [
  { value: 'weight', label: 'Weight', units: ['lb', 'g', 'kg'] },
  { value: 'volume', label: 'Volume', units: ['ml', 'L'] },
  { value: 'count', label: 'Count', units: ['ea', 'pc', 'pk'] },
];

/**
 * Universal discovery tags - the shared vocabulary used to build shop
 * collections and filters. Offered as one-click chips; admins can still
 * add custom tags freely.
 */
export const DISCOVERY_TAGS = [
  'Cookware',
  'Zero Waste',
  'Pantry Staple',
  'Baking',
  'Local Sourced',
  'Root Crop',
  'Eco-Friendly',
  'New Arrival',
  'Best Seller',
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

/** One-line explainer shown under each attribute checkbox. */
export const ATTRIBUTE_DESCRIPTIONS: Record<string, string> = {
  organic: 'Certified or grown organically',
  local: 'Sourced directly from regional farmers & producers',
  glutenFree: 'Safe for gluten-sensitive diets',
  dairyFree: 'Contains no milk or dairy derivatives',
  vegan: '100% plant-based',
  nutFree: 'Processed free from tree nuts / peanuts',
  sustainableMaterial: 'Sustainable wood, bamboo, cloth or recyclable metals',
  reusable: 'Designed to replace single-use disposables',
  plasticFree: 'Product & delivery packaging contain zero plastic',
  foodSafe: 'Safe for high-heat cooking & food storage',
  upcycled: 'Reclaimed materials / full zero-waste lifecycle',
};

export function categoryLabel(code: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.code === code)?.label ?? code;
}

export function isHomeCategory(code: string): boolean {
  return code === HOME_CATEGORY_CODE;
}
