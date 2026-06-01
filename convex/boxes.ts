import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthedUser, getAuthedUserOrNull } from "./lib/auth";
import { resolveZoneForZip } from "./deliveryZones";
import { computePeriodWindow, isoWeekKey } from "./lib/time";
import { reserveImpl, releaseImpl } from "./inventory";

// ─────────────────────────────────────────────────────────────────
// Internal: box lifecycle (called from convex/http.ts)
// ─────────────────────────────────────────────────────────────────

/**
 * INTERNAL — create a draft box for the next delivery period when
 * Stripe issues `invoice.created` for a subscription. Idempotent on
 * (subscriptionId, weekKey): re-firing returns the existing box.
 */
export const generateForPeriod = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    stripeInvoiceId: v.optional(v.string()),
    periodStartMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) throw new Error("Subscription not found");
    if (subscription.status === "cancelled") return null;

    const periodStart = args.periodStartMs ?? Date.now();

    // Resolve delivery zone via the user's primary address.
    const primaryAddress = subscription.primaryAddressId
      ? await ctx.db.get(subscription.primaryAddressId)
      : await findPrimaryAddress(ctx, subscription.userId);
    const zone = primaryAddress
      ? await resolveZoneForZip(ctx, primaryAddress.zip)
      : null;

    // Compute period window. Fallbacks: Sun cutoff @ 0h UTC, Wed delivery.
    const { cutoffAt, deliveryDate, weekKey } = computePeriodWindow(
      periodStart,
      zone?.cutoffDayOfWeek ?? 0,
      zone?.cutoffHour ?? 0,
      zone?.deliveryDayOfWeek ?? 3
    );

    // Idempotency: bail if a box for this subscription+week already exists.
    const existing = await ctx.db
      .query("boxes")
      .withIndex("by_subscription_week", (q) =>
        q.eq("subscriptionId", subscription._id).eq("weekKey", weekKey)
      )
      .unique();
    if (existing) {
      if (args.stripeInvoiceId && !existing.stripeInvoiceId) {
        await ctx.db.patch(existing._id, { stripeInvoiceId: args.stripeInvoiceId });
      }
      return existing._id;
    }

    const boxId = await ctx.db.insert("boxes", {
      userId: subscription.userId,
      subscriptionId: subscription._id,
      weekKey,
      status: "draft",
      cutoffAt,
      deliveryDate,
      addressSnapshot: primaryAddress
        ? {
            line1: primaryAddress.line1,
            line2: primaryAddress.line2,
            city: primaryAddress.city,
            state: primaryAddress.state,
            zip: primaryAddress.zip,
            country: primaryAddress.country,
          }
        : undefined,
      deliveryZoneId: zone?._id,
      stripeInvoiceId: args.stripeInvoiceId,
      shippingCents: zone?.shippingFeeCents ?? 0,
      createdAt: Date.now(),
    });

    // Seed the default item set for the subscription's tier.
    const defaults = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(500);
    for (const product of defaults) {
      if (!product.defaultForTiers?.includes(subscription.tier)) continue;
      // Reserve 1 unit; if inventory is insufficient, skip silently —
      // the box can still be customized.
      try {
        await reserveImpl(ctx, {
          productId: product._id,
          weekKey,
          qty: 1,
          deliveryZoneId: zone?._id,
        });
      } catch {
        continue;
      }
      await ctx.db.insert("boxItems", {
        boxId,
        productId: product._id,
        quantity: 1,
        unitPriceCentsAtLock: product.basePriceCents,
        source: "default",
        createdAt: Date.now(),
      });
    }

    return boxId;
  },
});

/**
 * INTERNAL — Stripe `invoice.paid`: mark the matching box paid and
 * record totals from the invoice payload.
 */
export const markPaid = internalMutation({
  args: {
    stripeInvoiceId: v.string(),
    totalCents: v.number(),
    subtotalCents: v.optional(v.number()),
    taxCents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const box = await ctx.db
      .query("boxes")
      .withIndex("by_stripe_invoice", (q) =>
        q.eq("stripeInvoiceId", args.stripeInvoiceId)
      )
      .unique();
    if (!box) return null;
    await ctx.db.patch(box._id, {
      status: box.status === "draft" ? "locked" : box.status,
      paidAt: Date.now(),
      totalCents: args.totalCents,
      subtotalCents: args.subtotalCents,
      taxCents: args.taxCents,
    });
    return box._id;
  },
});

/**
 * INTERNAL — Stripe `invoice.payment_failed`.
 */
export const markPastDue = internalMutation({
  args: { stripeInvoiceId: v.string() },
  handler: async (ctx, args) => {
    const box = await ctx.db
      .query("boxes")
      .withIndex("by_stripe_invoice", (q) =>
        q.eq("stripeInvoiceId", args.stripeInvoiceId)
      )
      .unique();
    if (!box) return null;
    await ctx.db.patch(box._id, { status: "past_due" });
    return box._id;
  },
});

/**
 * INTERNAL — cron-fired sweep. Promotes any `draft` box whose cutoff
 * has passed to `locked`. Bounded per invocation to stay under the
 * transaction limit; re-run is cheap.
 */
export const lockExpired = internalMutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const batchSize = args.batchSize ?? 100;
    const rows = await ctx.db
      .query("boxes")
      .withIndex("by_status_cutoff", (q) =>
        q.eq("status", "draft").lte("cutoffAt", now)
      )
      .take(batchSize);
    for (const row of rows) {
      await ctx.db.patch(row._id, { status: "locked" });
    }
    return rows.length;
  },
});

/**
 * INTERNAL — cron-fired sweep. Marks `shipped` boxes as `delivered`
 * once `deliveryDate` has passed.
 */
export const markDeliveredSweep = internalMutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const batchSize = args.batchSize ?? 100;
    const rows = await ctx.db
      .query("boxes")
      .withIndex("by_status_delivery", (q) =>
        q.eq("status", "shipped").lte("deliveryDate", now)
      )
      .take(batchSize);
    for (const row of rows) {
      await ctx.db.patch(row._id, {
        status: "delivered",
        deliveredAt: Date.now(),
      });
    }
    return rows.length;
  },
});

// ─────────────────────────────────────────────────────────────────
// Public: customization (auth + ownership + lifecycle gate)
// ─────────────────────────────────────────────────────────────────

async function loadOwnedDraftBox(
  ctx: MutationCtx,
  boxId: Id<"boxes">
): Promise<{ user: Doc<"users">; box: Doc<"boxes"> }> {
  const user = await getAuthedUser(ctx);
  const box = await ctx.db.get(boxId);
  if (!box) throw new Error("Box not found");
  if (box.userId !== user._id) throw new Error("Unauthorized — not your box");
  if (box.status !== "draft") {
    throw new Error(
      `Box is ${box.status}; customization is closed (was open until cutoff)`
    );
  }
  if (Date.now() > box.cutoffAt) {
    throw new Error("Customization cutoff has passed");
  }
  return { user, box };
}

export const addItem = mutation({
  args: {
    boxId: v.id("boxes"),
    productId: v.id("products"),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { box } = await loadOwnedDraftBox(ctx, args.boxId);
    const qty = args.quantity ?? 1;
    if (qty <= 0) throw new Error("quantity must be > 0");

    const product = await ctx.db.get(args.productId);
    if (!product || !product.active) {
      throw new Error("Product not found or inactive");
    }

    await reserveImpl(ctx, {
      productId: args.productId,
      weekKey: box.weekKey,
      qty,
      deliveryZoneId: box.deliveryZoneId,
    });

    const existing = await ctx.db
      .query("boxItems")
      .withIndex("by_box_product", (q) =>
        q.eq("boxId", box._id).eq("productId", args.productId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { quantity: existing.quantity + qty });
      return existing._id;
    }
    return await ctx.db.insert("boxItems", {
      boxId: box._id,
      productId: args.productId,
      quantity: qty,
      unitPriceCentsAtLock: product.basePriceCents,
      source: "added",
      createdAt: Date.now(),
    });
  },
});

export const setItemQuantity = mutation({
  args: {
    boxId: v.id("boxes"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const { box } = await loadOwnedDraftBox(ctx, args.boxId);
    if (args.quantity < 0) throw new Error("quantity must be ≥ 0");

    const existing = await ctx.db
      .query("boxItems")
      .withIndex("by_box_product", (q) =>
        q.eq("boxId", box._id).eq("productId", args.productId)
      )
      .unique();

    if (!existing) {
      // Treat setQuantity on a new product as an add.
      if (args.quantity === 0) return null;
      await reserveImpl(ctx, {
        productId: args.productId,
        weekKey: box.weekKey,
        qty: args.quantity,
        deliveryZoneId: box.deliveryZoneId,
      });
      const product = await ctx.db.get(args.productId);
      if (!product) throw new Error("Product not found");
      return await ctx.db.insert("boxItems", {
        boxId: box._id,
        productId: args.productId,
        quantity: args.quantity,
        unitPriceCentsAtLock: product.basePriceCents,
        source: "added",
        createdAt: Date.now(),
      });
    }

    const delta = args.quantity - existing.quantity;
    if (delta > 0) {
      await reserveImpl(ctx, {
        productId: args.productId,
        weekKey: box.weekKey,
        qty: delta,
        deliveryZoneId: box.deliveryZoneId,
      });
    } else if (delta < 0) {
      await releaseImpl(ctx, {
        productId: args.productId,
        weekKey: box.weekKey,
        qty: -delta,
        deliveryZoneId: box.deliveryZoneId,
      });
    }
    if (args.quantity === 0) {
      await ctx.db.delete(existing._id);
      return null;
    }
    await ctx.db.patch(existing._id, { quantity: args.quantity });
    return existing._id;
  },
});

export const removeItem = mutation({
  args: { boxId: v.id("boxes"), productId: v.id("products") },
  handler: async (ctx, args) => {
    const { box } = await loadOwnedDraftBox(ctx, args.boxId);
    const existing = await ctx.db
      .query("boxItems")
      .withIndex("by_box_product", (q) =>
        q.eq("boxId", box._id).eq("productId", args.productId)
      )
      .unique();
    if (!existing) return null;
    await releaseImpl(ctx, {
      productId: args.productId,
      weekKey: box.weekKey,
      qty: existing.quantity,
      deliveryZoneId: box.deliveryZoneId,
    });
    await ctx.db.delete(existing._id);
    return existing._id;
  },
});

export const swapItem = mutation({
  args: {
    boxId: v.id("boxes"),
    fromProductId: v.id("products"),
    toProductId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const { box } = await loadOwnedDraftBox(ctx, args.boxId);
    const existing = await ctx.db
      .query("boxItems")
      .withIndex("by_box_product", (q) =>
        q.eq("boxId", box._id).eq("productId", args.fromProductId)
      )
      .unique();
    if (!existing) throw new Error("Item to swap not found in box");

    const toProduct = await ctx.db.get(args.toProductId);
    if (!toProduct || !toProduct.active) {
      throw new Error("Replacement product not found or inactive");
    }

    // Release old, reserve new — same qty.
    await reserveImpl(ctx, {
      productId: args.toProductId,
      weekKey: box.weekKey,
      qty: existing.quantity,
      deliveryZoneId: box.deliveryZoneId,
    });
    await releaseImpl(ctx, {
      productId: args.fromProductId,
      weekKey: box.weekKey,
      qty: existing.quantity,
      deliveryZoneId: box.deliveryZoneId,
    });
    await ctx.db.delete(existing._id);
    return await ctx.db.insert("boxItems", {
      boxId: box._id,
      productId: args.toProductId,
      quantity: existing.quantity,
      unitPriceCentsAtLock: toProduct.basePriceCents,
      source: "swap",
      createdAt: Date.now(),
    });
  },
});

export const skipWeek = mutation({
  args: { boxId: v.id("boxes") },
  handler: async (ctx, args) => {
    const { box } = await loadOwnedDraftBox(ctx, args.boxId);
    // Release all reservations.
    const items = await ctx.db
      .query("boxItems")
      .withIndex("by_box", (q) => q.eq("boxId", box._id))
      .collect();
    for (const item of items) {
      await releaseImpl(ctx, {
        productId: item.productId,
        weekKey: box.weekKey,
        qty: item.quantity,
        deliveryZoneId: box.deliveryZoneId,
      });
      await ctx.db.delete(item._id);
    }
    await ctx.db.patch(box._id, { status: "skipped" });
    return box._id;
  },
});

// ─────────────────────────────────────────────────────────────────
// Public read API
// ─────────────────────────────────────────────────────────────────

async function expandBox(ctx: QueryCtx, box: Doc<"boxes">) {
  const items = await ctx.db
    .query("boxItems")
    .withIndex("by_box", (q) => q.eq("boxId", box._id))
    .take(500);
  return { ...box, items };
}

export const getCurrentBox = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return null;
    const rows = await ctx.db
      .query("boxes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
    const current =
      rows.find((b) => b.status === "draft") ??
      rows.find((b) => b.status === "locked") ??
      null;
    return current ? await expandBox(ctx, current) : null;
  },
});

export const getMyUpcomingBoxes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return [];
    const now = Date.now();
    const rows = await ctx.db
      .query("boxes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
    return rows.filter((b) => b.deliveryDate >= now);
  },
});

export const getMyBoxHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return [];
    return await ctx.db
      .query("boxes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const getBox = query({
  args: { boxId: v.id("boxes") },
  handler: async (ctx, args) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return null;
    const box = await ctx.db.get(args.boxId);
    if (!box || box.userId !== user._id) return null;
    return await expandBox(ctx, box);
  },
});

/**
 * List active products available to swap into a given box, filtered by
 * the box's delivery week and zone (drops out-of-stock SKUs).
 */
export const listAvailableProductsForBox = query({
  args: { boxId: v.id("boxes") },
  handler: async (ctx, args) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return [];
    const box = await ctx.db.get(args.boxId);
    if (!box || box.userId !== user._id) return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(500);

    const out: Array<Doc<"products"> & { remaining: number }> = [];
    for (const p of products) {
      const inv = await ctx.db
        .query("weeklyInventory")
        .withIndex("by_product_week", (q) =>
          q.eq("productId", p._id).eq("weekKey", box.weekKey)
        )
        .collect();
      // Prefer zone-specific row, else global.
      const row =
        inv.find((r) => r.deliveryZoneId === box.deliveryZoneId) ??
        inv.find((r) => r.deliveryZoneId === undefined);
      const remaining = row
        ? Math.max(0, row.quantityAvailable - row.quantityReserved)
        : 0;
      if (remaining > 0) out.push({ ...p, remaining });
    }
    return out;
  },
});

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
async function findPrimaryAddress(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  return await ctx.db
    .query("addresses")
    .withIndex("by_user_primary", (q) =>
      q.eq("userId", userId).eq("isPrimary", true)
    )
    .unique();
}

export const _isoWeekKeyForNow = query({
  args: {},
  handler: async () => isoWeekKey(Date.now()),
});
