/**
 * Shared, framework-agnostic stock logic so the admin, storefront and
 * checkout all agree on what "sold out" / "low stock" means.
 */

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export interface StockFields {
  trackInventory?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface StockStatus {
  /** Whether this product enforces on-hand stock at all. */
  tracked: boolean;
  /** On-hand quantity (0 when unset). */
  quantity: number;
  /** Tracked and nothing left — cannot be purchased. */
  soldOut: boolean;
  /** Tracked, in stock, but at or below the low-stock threshold. */
  low: boolean;
}

export function stockStatus(p: StockFields): StockStatus {
  const tracked = p.trackInventory === true;
  const quantity = p.stockQuantity ?? 0;
  const threshold = p.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  return {
    tracked,
    quantity,
    soldOut: tracked && quantity <= 0,
    low: tracked && quantity > 0 && quantity <= threshold,
  };
}
