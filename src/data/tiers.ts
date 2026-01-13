import { SubscriptionTier } from '../types/subscription';

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'supported',
    name: 'Supported Haul',
    description: 'A care package for those in need. Focused on maximum caloric density and utility per dollar.',
    price: {
      fortnightly: 19.00,
      monthly: 35.00,
      yearly: 350.00,
      currency: 'USD'
    },
    items: [
      { id: 'rice-3', name: 'White Rice', quantity: 3, unit: 'kg', category: 'Grains' },
      { id: 'flour-3', name: 'All-Purpose Flour', quantity: 3, unit: 'kg', category: 'Grains' },
      { id: 'oil-1', name: 'Sunflower Oil', quantity: 1, unit: 'L', category: 'Pantry' },
      { id: 'sugar-1', name: 'White Sugar', quantity: 1, unit: 'kg', category: 'Pantry' },
      { id: 'pasta-2', name: 'Pasta', quantity: 2, unit: 'pack', category: 'Grains' },
      { id: 'beans-1', name: 'Dry Beans', quantity: 1, unit: 'kg', category: 'Grains' }
    ],
    substitutionPolicy: {
      rule: 'Strict Caloric Match',
      priority: ['Same Category', 'Higher Calorie Alternative'],
      notificationThreshold: 'Notify on ANY substitution'
    }
  },
  {
    id: 'essential',
    name: 'Essential Haul',
    description: 'The absolute basics for a small household. Covers the core staples needed for daily cooking.',
    price: {
      fortnightly: 29.00,
      monthly: 49.00,
      yearly: 490.00,
      currency: 'USD'
    },
    items: [
      { id: 'rice-5', name: 'White Rice', quantity: 5, unit: 'kg', category: 'Grains' },
      { id: 'flour-5', name: 'All-Purpose Flour', quantity: 5, unit: 'kg', category: 'Grains' },
      { id: 'oil-2', name: 'Sunflower Oil', quantity: 2, unit: 'L', category: 'Pantry' },
      { id: 'sugar-2', name: 'White Sugar', quantity: 2, unit: 'kg', category: 'Pantry' },
      { id: 'pasta-3', name: 'Pasta (Spaghetti/Penne)', quantity: 3, unit: 'pack', category: 'Grains' },
      { id: 'beans-2', name: 'Dry Beans', quantity: 2, unit: 'kg', category: 'Grains' },
      { id: 'salt-1', name: 'Table Salt', quantity: 1, unit: 'kg', category: 'Pantry' }
    ],
    substitutionPolicy: {
      rule: 'Equal or Higher Value',
      priority: ['Same Item (Different Brand)', 'Same Category (e.g., Penne for Spaghetti)', 'Similar Utility (e.g., Rice for Pasta)'],
      notificationThreshold: 'Notify if > 2 items substituted'
    }
  },
  {
    id: 'household',
    name: 'Household Haul',
    description: 'Designed for families. Larger quantities of staples plus comfort items like coffee and tea.',
    price: {
      fortnightly: 49.00,
      monthly: 89.00,
      yearly: 890.00,
      currency: 'USD'
    },
    items: [
      { id: 'rice-10', name: 'White Rice', quantity: 10, unit: 'kg', category: 'Grains' },
      { id: 'flour-10', name: 'All-Purpose Flour', quantity: 10, unit: 'kg', category: 'Grains' },
      { id: 'oil-4', name: 'Sunflower Oil', quantity: 4, unit: 'L', category: 'Pantry' },
      { id: 'sugar-4', name: 'White Sugar', quantity: 4, unit: 'kg', category: 'Pantry' },
      { id: 'pasta-6', name: 'Pasta (Assorted)', quantity: 6, unit: 'pack', category: 'Grains' },
      { id: 'beans-4', name: 'Dry Beans', quantity: 4, unit: 'kg', category: 'Grains' },
      { id: 'coffee-500', name: 'Ground Coffee', quantity: 500, unit: 'g', category: 'Beverage' },
      { id: 'tea-1', name: 'Black Tea', quantity: 1, unit: 'box', category: 'Beverage' },
      { id: 'tomatoes-4', name: 'Canned Tomatoes', quantity: 4, unit: 'can', category: 'Canned' }
    ],
    substitutionPolicy: {
      rule: 'Equal or Higher Value',
      priority: ['Same Item (Different Brand)', 'Same Category', 'Similar Utility'],
      notificationThreshold: 'Notify if > 3 items substituted'
    }
  },
  {
    id: 'premium',
    name: 'Premium Haul',
    description: 'Elevated essentials with organic options and specialty items for the discerning household.',
    price: {
      fortnightly: 69.00,
      monthly: 129.00,
      yearly: 1290.00,
      currency: 'USD'
    },
    items: [
      { id: 'rice-organic-8', name: 'Organic Basmati Rice', quantity: 8, unit: 'kg', category: 'Grains' },
      { id: 'flour-organic-8', name: 'Organic Whole Wheat Flour', quantity: 8, unit: 'kg', category: 'Grains' },
      { id: 'oil-olive-2', name: 'Extra Virgin Olive Oil', quantity: 2, unit: 'L', category: 'Pantry' },
      { id: 'sugar-raw-3', name: 'Raw Cane Sugar', quantity: 3, unit: 'kg', category: 'Pantry' },
      { id: 'pasta-artisan-4', name: 'Artisan Pasta Selection', quantity: 4, unit: 'pack', category: 'Grains' },
      { id: 'quinoa-2', name: 'Organic Quinoa', quantity: 2, unit: 'kg', category: 'Grains' },
      { id: 'coffee-specialty-750', name: 'Single Origin Coffee', quantity: 750, unit: 'g', category: 'Beverage' },
      { id: 'honey-1', name: 'Raw Honey', quantity: 1, unit: 'kg', category: 'Pantry' },
      { id: 'nuts-mixed-500', name: 'Mixed Nuts', quantity: 500, unit: 'g', category: 'Snacks' }
    ],
    substitutionPolicy: {
      rule: 'Premium Quality Match',
      priority: ['Same Premium Brand', 'Organic Alternative', 'Artisan Option'],
      notificationThreshold: 'Notify if > 2 items substituted'
    }
  },
  {
    id: 'gourmet',
    name: 'Gourmet Haul',
    description: 'Curated selection of premium ingredients and specialty items for culinary enthusiasts.',
    price: {
      fortnightly: 95.00,
      monthly: 179.00,
      yearly: 1790.00,
      currency: 'USD'
    },
    items: [
      { id: 'rice-arborio-3', name: 'Arborio Rice', quantity: 3, unit: 'kg', category: 'Grains' },
      { id: 'flour-tipo-3', name: 'Tipo 00 Flour', quantity: 3, unit: 'kg', category: 'Grains' },
      { id: 'oil-truffle-500', name: 'Truffle Oil', quantity: 500, unit: 'ml', category: 'Pantry' },
      { id: 'vinegar-balsamic-500', name: 'Aged Balsamic Vinegar', quantity: 500, unit: 'ml', category: 'Pantry' },
      { id: 'saffron-5', name: 'Premium Saffron', quantity: 5, unit: 'g', category: 'Spices' },
      { id: 'chocolate-70-500', name: '70% Dark Chocolate', quantity: 500, unit: 'g', category: 'Pantry' },
      { id: 'coffee-kona-500', name: 'Kona Coffee Beans', quantity: 500, unit: 'g', category: 'Beverage' },
      { id: 'cheese-parm-1', name: 'Parmigiano Reggiano', quantity: 1, unit: 'kg', category: 'Dairy' },
      { id: 'mushrooms-dried-200', name: 'Dried Porcini Mushrooms', quantity: 200, unit: 'g', category: 'Pantry' }
    ],
    substitutionPolicy: {
      rule: 'Artisan Quality Only',
      priority: ['Same Artisan Producer', 'Similar Gourmet Item', 'Premium Alternative'],
      notificationThreshold: 'Notify on ANY substitution'
    }
  },
  {
    id: 'bulk',
    name: 'Bulk Commercial',
    description: 'Large quantities for restaurants, cafes, or large families. Maximum value per unit.',
    price: {
      fortnightly: 135.00,
      monthly: 249.00,
      yearly: 2490.00,
      currency: 'USD'
    },
    items: [
      { id: 'rice-bulk-25', name: 'White Rice (Bulk)', quantity: 25, unit: 'kg', category: 'Grains' },
      { id: 'flour-bulk-25', name: 'All-Purpose Flour (Bulk)', quantity: 25, unit: 'kg', category: 'Grains' },
      { id: 'oil-bulk-10', name: 'Sunflower Oil (Bulk)', quantity: 10, unit: 'L', category: 'Pantry' },
      { id: 'sugar-bulk-10', name: 'White Sugar (Bulk)', quantity: 10, unit: 'kg', category: 'Pantry' },
      { id: 'pasta-bulk-12', name: 'Pasta (Bulk Pack)', quantity: 12, unit: 'pack', category: 'Grains' },
      { id: 'beans-bulk-10', name: 'Dry Beans (Bulk)', quantity: 10, unit: 'kg', category: 'Grains' },
      { id: 'coffee-bulk-2', name: 'Ground Coffee (Bulk)', quantity: 2, unit: 'kg', category: 'Beverage' },
      { id: 'salt-bulk-5', name: 'Table Salt (Bulk)', quantity: 5, unit: 'kg', category: 'Pantry' },
      { id: 'tomatoes-bulk-12', name: 'Canned Tomatoes (Case)', quantity: 12, unit: 'can', category: 'Canned' }
    ],
    substitutionPolicy: {
      rule: 'Bulk Quantity Match',
      priority: ['Same Bulk Size', 'Equivalent Total Weight', 'Commercial Grade'],
      notificationThreshold: 'Notify if > 4 items substituted'
    }
  }
];
