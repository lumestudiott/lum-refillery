import { SubscriptionTier } from '../types/subscription';

/**
 * Calculate yearly savings for a subscription tier
 * @param tier - The subscription tier
 * @returns The amount saved per year when choosing yearly vs monthly billing
 */
export const calculateYearlySavings = (tier: SubscriptionTier): number => {
  return Math.round((tier.price.monthly * 12) - tier.price.yearly);
};

/**
 * Calculate the maximum yearly savings across all tiers
 * @param tiers - Array of subscription tiers
 * @returns The maximum savings amount
 */
export const getMaxYearlySavings = (tiers: SubscriptionTier[]): number => {
  return Math.max(...tiers.map(tier => calculateYearlySavings(tier)));
};

/**
 * Calculate savings percentage for yearly billing
 * @param tier - The subscription tier
 * @returns The percentage saved when choosing yearly vs monthly
 */
export const calculateYearlySavingsPercentage = (tier: SubscriptionTier): number => {
  const monthlyCost = tier.price.monthly * 12;
  const yearlyCost = tier.price.yearly;
  return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
};

/**
 * Format price with currency symbol
 * @param amount - The price amount
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, currency: string = '$'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Get billing cycle display name
 * @param billingCycle - The billing cycle
 * @returns Human-readable billing cycle name
 */
export const getBillingCycleDisplayName = (billingCycle: string): string => {
  switch (billingCycle) {
    case 'fortnightly':
      return 'fortnight';
    case 'monthly':
      return 'month';
    case 'yearly':
      return 'year';
    default:
      return billingCycle;
  }
};