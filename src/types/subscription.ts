export type Unit = 'kg' | 'L' | 'pack' | 'can' | 'box' | 'g' | 'pcs' | 'ml';

export interface SubscriptionItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: 'Grains' | 'Pantry' | 'Beverage' | 'Canned' | 'Other' | 'Snacks' | 'Spices' | 'Dairy';
}

export interface SubstitutionPolicy {
  rule: string;
  priority: string[];
  notificationThreshold: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: {
    fortnightly: number;
    monthly: number;
    yearly: number;
    currency: string;
  };
  items: SubscriptionItem[];
  substitutionPolicy: SubstitutionPolicy;
}
