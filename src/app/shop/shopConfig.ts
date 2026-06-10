export const SHOP_CATEGORIES = [
  {
    id: 'all',
    label: 'All',
    subcategories: ['Featured Curations', 'New Arrivals', 'Best Sellers'],
  },
  {
    id: 'hauls',
    label: 'Hauls',
    subcategories: ['Weekly Hauls', 'Family Hauls', 'Starter Hauls'],
  },
  {
    id: 'beverage',
    label: 'Beverages',
    subcategories: ['Water & Seltzer', 'Juice', 'Kombucha', 'Coffee', 'Tea', 'Functional Sodas', 'Non-Alcoholic'],
  },
  {
    id: 'care',
    label: 'Care',
    subcategories: ['Body', 'Hair', 'Face', 'Oral Care', 'Deodorant', 'Home & Cleaning'],
  },
  // --- Disabled categories (re-enable when ready) ---
  // {
  //   id: 'new-seasonal',
  //   label: 'New & Seasonal',
  //   subcategories: ['New', 'Best Sellers', 'Picnic', 'AAPI Heritage Month', 'Spring Favorites'],
  // },
  // {
  //   id: 'produce',
  //   label: 'Produce',
  //   subcategories: ['Produce Boxes', 'New & Peak Season', 'Fruits', 'Vegetables', 'Leafy Greens', 'Herbs & Aromatics', 'Flowers & Decoratives', 'Frozen'],
  // },
  // {
  //   id: 'protein',
  //   label: 'Meat & Seafood',
  //   subcategories: ['Featured Meat & Seafood', 'Poultry', 'Beef', 'Pork', 'Lamb & Game Meat', 'Seafood', 'Bacon & Sausage', 'Charcuterie & Deli', 'Plant-Based Proteins'],
  // },
  // {
  //   id: 'dairy',
  //   label: 'Dairy & Eggs',
  //   subcategories: ['Featured Dairy & Eggs', 'Milk & Cream', 'Eggs & Butter', 'Yogurt & Cultured Dairy', 'Cheese', 'Desserts', 'Plant-Based'],
  // },
  // {
  //   id: 'bakery',
  //   label: 'Bakery',
  //   subcategories: ['Featured Bakery', 'Breads & Loaves', 'Bagels & Rolls', 'Pastries & Sweets', 'Tortillas & Wraps'],
  // },
  // {
  //   id: 'meals',
  //   label: 'Easy Meals',
  //   subcategories: ['Featured Easy Meals', 'Entrees & Breakfast', 'Salads, Sides & Starters', 'Soups & Broths', 'Kits & Recipe Bundles'],
  // },
  // {
  //   id: 'pantry',
  //   label: 'Pantry',
  //   subcategories: ['Featured Pantry Items', 'Condiments & Sauces', 'Oils & Vinegar', 'Pasta & Noodles', 'Grains & Beans', 'Spreads & Nut Butters', 'Snacks', 'Sweets & Chocolate', 'Pickled & Preserved', 'Breakfast & Cereals', 'Cooking & Baking', 'Tinned Fish', 'Broths & Tomatoes'],
  // },
  // {
  //   id: 'savings',
  //   label: 'Savings',
  //   subcategories: ['On Sale', 'Everyday Savings', 'Boxes and Bundles'],
  // },
] as const;

export const SHOP_SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A to Z' },
] as const;

export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]['id'];
export type ShopSortId = (typeof SHOP_SORT_OPTIONS)[number]['id'];

export function normalizeCategory(value: string | undefined): ShopCategoryId {
  const match = SHOP_CATEGORIES.find((category) => category.id === value);
  return match?.id ?? 'all';
}

export function normalizeSort(value: string | undefined): ShopSortId {
  const match = SHOP_SORT_OPTIONS.find((option) => option.id === value);
  return match?.id ?? 'featured';
}
