import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/auth";

/**
 * INTERNAL helper — reserve `qty` units of a product for a given week,
 * scoped optionally to a delivery zone. Throws if not enough remaining.
 *
 * Callers must be inside a mutation transaction so the reserve count is
 * consistent under concurrent writes (Convex serializes mutations on
 * the same document; this function only patches one row).
 */
export async function reserveImpl(
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    weekKey: string;
    qty: number;
    deliveryZoneId?: Id<"deliveryZones">;
  }
) {
  if (args.qty <= 0) throw new Error("qty must be > 0");

  const row = await findOrCreateInventoryRow(ctx, args);
  const remaining = row.quantityAvailable - row.quantityReserved;
  if (remaining < args.qty) {
    throw new Error(
      `Insufficient inventory for product ${String(args.productId)} ` +
        `in week ${args.weekKey} (need ${args.qty}, have ${remaining})`
    );
  }
  await ctx.db.patch(row._id, {
    quantityReserved: row.quantityReserved + args.qty,
  });
  return row._id;
}

/**
 * INTERNAL helper — release a previously-reserved quantity (e.g. when a
 * user removes an item from a draft box, or a box is cancelled before
 * shipment).
 */
export async function releaseImpl(
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    weekKey: string;
    qty: number;
    deliveryZoneId?: Id<"deliveryZones">;
  }
) {
  if (args.qty <= 0) return;

  const row = await findOrCreateInventoryRow(ctx, args);
  const newReserved = Math.max(0, row.quantityReserved - args.qty);
  await ctx.db.patch(row._id, { quantityReserved: newReserved });
}

async function findOrCreateInventoryRow(
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    weekKey: string;
    deliveryZoneId?: Id<"deliveryZones">;
  }
) {
  // Find by (productId, weekKey); zone-scoped rows live alongside global rows.
  const rows = await ctx.db
    .query("weeklyInventory")
    .withIndex("by_product_week", (q) =>
      q.eq("productId", args.productId).eq("weekKey", args.weekKey)
    )
    .collect();
  const zoneId = args.deliveryZoneId;
  const exact =
    rows.find((r) => r.deliveryZoneId === zoneId) ??
    rows.find((r) => r.deliveryZoneId === undefined);
  if (exact) return exact;

  // No row exists yet; create one with zero allocation. The admin will
  // need to top it up before this product can actually ship.
  const newId = await ctx.db.insert("weeklyInventory", {
    productId: args.productId,
    weekKey: args.weekKey,
    quantityAvailable: 0,
    quantityReserved: 0,
    deliveryZoneId: zoneId,
  });
  const inserted = await ctx.db.get(newId);
  if (!inserted) throw new Error("Failed to read back inserted inventory row");
  return inserted;
}

// ─── Admin write API ───────────────────────────────────────────────
export const setAllocation = mutation({
  args: {
    productId: v.id("products"),
    weekKey: v.string(),
    quantityAvailable: v.number(),
    deliveryZoneId: v.optional(v.id("deliveryZones")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await findOrCreateInventoryRow(ctx, args);
    await ctx.db.patch(row._id, { quantityAvailable: args.quantityAvailable });
    return row._id;
  },
});

export const internalSetAllocation = internalMutation({
  args: {
    productId: v.id("products"),
    weekKey: v.string(),
    quantityAvailable: v.number(),
    deliveryZoneId: v.optional(v.id("deliveryZones")),
  },
  handler: async (ctx, args) => {
    const row = await findOrCreateInventoryRow(ctx, args);
    await ctx.db.patch(row._id, { quantityAvailable: args.quantityAvailable });
    return row._id;
  },
});

// ─── Public read API ───────────────────────────────────────────────
export const remainingForWeek = query({
  args: { weekKey: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("weeklyInventory")
      .withIndex("by_week", (q) => q.eq("weekKey", args.weekKey))
      .take(1000);
    return rows.map((r) => ({
      productId: r.productId,
      deliveryZoneId: r.deliveryZoneId ?? null,
      remaining: Math.max(0, r.quantityAvailable - r.quantityReserved),
    }));
  },
});
