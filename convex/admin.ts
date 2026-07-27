import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { isAdmin, requireAdmin } from "./lib/auth";

/**
 * Admin API - read + write surface for the back-office dashboard at /admin.
 *
 * Every function in this module is gated by `requireAdmin` (or `isAdmin` for
 * the soft `amIAdmin` check used by the UI guard). Admin is granted by either
 * `users.isAdmin === true` or a Clerk JWT role claim - see `lib/auth.ts`.
 *
 * List queries are intentionally bounded with `.take(...)` and ordered newest
 * first. This keeps the back-office cheap for the MVP dataset; if a table
 * grows large, migrate the corresponding query to `paginationOptsValidator`.
 */

const LIST_LIMIT = 500;

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/** Build an id→user map so list joins avoid one `db.get` per row. */
async function buildUserMap(
  ctx: QueryCtx
): Promise<Map<Id<"users">, Doc<"users">>> {
  const users = await ctx.db.query("users").take(2000);
  const map = new Map<Id<"users">, Doc<"users">>();
  for (const u of users) map.set(u._id, u);
  return map;
}

/**
 * Recompute a user's denormalized subscription summary from the source of
 * truth (their `subscriptions` rows) and write it back to `users`. Keeps
 * `users.subscriptionTier/Status` consistent whenever an admin edits a sub.
 * Picks the "most relevant" subscription: active > paused > past_due > other,
 * tie-broken by most recently created.
 */
async function syncUserSubscriptionSummary(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<void> {
  const subs = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  if (subs.length === 0) {
    await ctx.db.patch(userId, {
      subscriptionTier: undefined,
      subscriptionStatus: undefined,
    });
    return;
  }
  const rank = (status: string) =>
    status === "active" ? 3 : status === "paused" ? 2 : status === "past_due" ? 1 : 0;
  const best = subs
    .slice()
    .sort((a, b) => rank(b.status) - rank(a.status) || b.createdAt - a.createdAt)[0];
  await ctx.db.patch(userId, {
    subscriptionTier: best.tier,
    subscriptionStatus: best.status,
  });
}

// ──────────────────────────────────────────────────────────────
// Auth probe
// ──────────────────────────────────────────────────────────────

/**
 * Soft admin check for the UI guard - returns a boolean instead of throwing,
 * so the dashboard can render an "access denied" state gracefully.
 */
export const amIAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});

// ──────────────────────────────────────────────────────────────
// Overview / stats
// ──────────────────────────────────────────────────────────────

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [
      users,
      subscriptions,
      products,
      boxes,
      shopOrders,
      gifts,
      newsletter,
      referrals,
    ] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("boxes").collect(),
      ctx.db.query("shopOrders").collect(),
      ctx.db.query("giftSubscriptions").collect(),
      ctx.db.query("newsletterSubscribers").collect(),
      ctx.db.query("referrals").collect(),
    ]);

    const subStatusCounts: Record<string, number> = {};
    for (const s of subscriptions) {
      subStatusCounts[s.status] = (subStatusCounts[s.status] ?? 0) + 1;
    }

    const boxStatusCounts: Record<string, number> = {};
    for (const b of boxes) {
      boxStatusCounts[b.status] = (boxStatusCounts[b.status] ?? 0) + 1;
    }

    // Revenue (in cents). Shop orders + paid boxes are stored in cents;
    // gift subscriptions store dollars on `amount`.
    const shopRevenueCents = shopOrders
      .filter((o) => o.status === "paid" || o.status === "fulfilled")
      .reduce((sum, o) => sum + (o.totalCents ?? 0), 0);
    const boxRevenueCents = boxes
      .filter((b) => b.paidAt)
      .reduce((sum, b) => sum + (b.totalCents ?? 0), 0);
    const giftRevenueCents = gifts
      .filter((g) => g.status === "paid" || g.status === "delivered")
      .reduce((sum, g) => sum + Math.round((g.amount ?? 0) * 100), 0);

    const creditsOutstandingCents = users.reduce(
      (sum, u) => sum + (u.creditsCents ?? 0),
      0
    );

    // ── Inventory summary (à-la-carte on-hand stock) ──
    const DEFAULT_LOW_STOCK = 5;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let trackedCount = 0;
    let onHandUnits = 0;
    for (const p of products) {
      if (!p.trackInventory) continue;
      trackedCount += 1;
      const qty = p.stockQuantity ?? 0;
      const threshold = p.lowStockThreshold ?? DEFAULT_LOW_STOCK;
      onHandUnits += qty;
      if (qty <= 0) outOfStock += 1;
      else if (qty <= threshold) lowStock += 1;
      else inStock += 1;
    }
    const lowStockItems = products
      .filter(
        (p) =>
          p.trackInventory &&
          (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? DEFAULT_LOW_STOCK)
      )
      .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))
      .slice(0, 8)
      .map((p) => ({
        name: p.name,
        sku: p.sku,
        quantity: p.stockQuantity ?? 0,
        out: (p.stockQuantity ?? 0) <= 0,
      }));

    // ── Attribute breakdown across the catalogue ──
    const attributeCounts: Record<string, number> = {};
    for (const p of products) {
      if (!p.attributes) continue;
      for (const [key, val] of Object.entries(p.attributes)) {
        if (val) attributeCounts[key] = (attributeCounts[key] ?? 0) + 1;
      }
    }

    return {
      counts: {
        users: users.length,
        admins: users.filter((u) => u.isAdmin).length,
        products: products.length,
        activeProducts: products.filter((p) => p.active).length,
        subscriptions: subscriptions.length,
        activeSubscriptions: subStatusCounts["active"] ?? 0,
        boxes: boxes.length,
        shopOrders: shopOrders.length,
        gifts: gifts.length,
        pendingGifts: gifts.filter((g) => g.status === "pending").length,
        newsletter: newsletter.length,
        referrals: referrals.length,
      },
      revenue: {
        shopCents: shopRevenueCents,
        boxCents: boxRevenueCents,
        giftCents: giftRevenueCents,
        totalCents: shopRevenueCents + boxRevenueCents + giftRevenueCents,
        creditsOutstandingCents,
      },
      subStatusCounts,
      boxStatusCounts,
      inventory: {
        inStock,
        lowStock,
        outOfStock,
        tracked: trackedCount,
        notTracked: products.length - trackedCount,
        onHandUnits,
        lowStockItems,
      },
      attributeCounts,
    };
  },
});

// ──────────────────────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────────────────────

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").order("desc").take(LIST_LIMIT);
  },
});

export const getUserDetail = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const [addresses, subscriptions, boxes, credits] = await Promise.all([
      ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("boxes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(50),
      ctx.db
        .query("creditTransactions")
        .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(50),
    ]);

    return { user, addresses, subscriptions, boxes, credits };
  },
});

/**
 * Toggle the Convex `isAdmin` flag on a user. (This does not touch Clerk
 * `publicMetadata` - the auth gate accepts either source.)
 */
export const setUserAdmin = mutation({
  args: { userId: v.id("users"), isAdmin: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isAdmin: args.isAdmin });
    return args.userId;
  },
});

/**
 * Permanently delete a user and all their related data.
 * Cascades to: addresses, subscriptions, boxes, creditTransactions,
 * shopOrders, shopOrderItems, and referrals.
 * Admins cannot delete their own account.
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Prevent self-deletion
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const callerToken =
        identity.tokenIdentifier ??
        `${identity.issuer}|${identity.subject}`;
      const target = await ctx.db.get(args.userId);
      if (target?.tokenIdentifier === callerToken) {
        throw new Error("You cannot delete your own account.");
      }
    }

    // Delete addresses
    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const a of addresses) await ctx.db.delete(a._id);

    // Delete subscriptions
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const s of subs) await ctx.db.delete(s._id);

    // Delete boxes
    const boxes = await ctx.db
      .query("boxes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const b of boxes) await ctx.db.delete(b._id);

    // Delete credit transactions
    const credits = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .collect();
    for (const c of credits) await ctx.db.delete(c._id);

    // Delete shop orders and their items
    const shopOrders = await ctx.db
      .query("shopOrders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const o of shopOrders) {
      const items = await ctx.db
        .query("shopOrderItems")
        .withIndex("by_order", (q) => q.eq("shopOrderId", o._id))
        .collect();
      for (const i of items) await ctx.db.delete(i._id);
      await ctx.db.delete(o._id);
    }

    // Delete the user document
    await ctx.db.delete(args.userId);
    return args.userId;
  },
});

// ──────────────────────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────────────────────

export const listProducts = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const products = args.category
      ? await ctx.db
          .query("products")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .take(LIST_LIMIT)
      : await ctx.db.query("products").order("desc").take(LIST_LIMIT);

    // Enrich each product with a variant stock summary so the overview page
    // can show warning icons without N+1 client-side queries.
    const enriched = await Promise.all(
      products.map(async (p) => {
        const variants = await ctx.db
          .query("productVariants")
          .withIndex("by_product", (q) => q.eq("productId", p._id))
          .take(200);
        const activeVariants = variants.filter((v) => v.active);
        const hasVariants = activeVariants.length > 0;
        let anyOutOfStock = false;
        let anyLow = false;
        for (const v of activeVariants) {
          if (v.trackInventory) {
            const qty = v.stockQuantity ?? 0;
            const threshold = v.lowStockThreshold ?? 5;
            if (qty <= 0) anyOutOfStock = true;
            else if (qty <= threshold) anyLow = true;
          }
        }
        return { ...p, variantStock: { hasVariants, anyOutOfStock, anyLow } };
      })
    );
    return enriched;
  },
});

export const setProductActive = mutation({
  args: { productId: v.id("products"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.productId, { active: args.active });
    return args.productId;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.productId);
    return args.productId;
  },
});

// ──────────────────────────────────────────────────────────────
// Subscriptions
// ──────────────────────────────────────────────────────────────

export const listSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const subs = await ctx.db
      .query("subscriptions")
      .order("desc")
      .take(LIST_LIMIT);
    const um = await buildUserMap(ctx);
    return subs.map((s) => ({
      ...s,
      userEmail: um.get(s.userId)?.email ?? null,
      userName: um.get(s.userId)?.name ?? null,
    }));
  },
});

const SUBSCRIPTION_STATUSES = [
  "active",
  "paused",
  "past_due",
  "cancelled",
  "incomplete",
];

export const setSubscriptionStatus = mutation({
  args: { subscriptionId: v.id("subscriptions"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!SUBSCRIPTION_STATUSES.includes(args.status)) {
      throw new Error(
        `Invalid status: ${args.status}. Must be one of: ${SUBSCRIPTION_STATUSES.join(", ")}`
      );
    }
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    await ctx.db.patch(args.subscriptionId, { status: args.status });
    // Keep the denormalized summary on the user record in sync.
    await syncUserSubscriptionSummary(ctx, sub.userId);
    return args.subscriptionId;
  },
});

// ──────────────────────────────────────────────────────────────
// Boxes (recurring delivery orders)
// ──────────────────────────────────────────────────────────────

export const listBoxes = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const boxes = args.status
      ? await ctx.db
          .query("boxes")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(LIST_LIMIT)
      : await ctx.db.query("boxes").order("desc").take(LIST_LIMIT);
    const um = await buildUserMap(ctx);
    return boxes.map((b) => ({
      ...b,
      userEmail: um.get(b.userId)?.email ?? null,
      userName: um.get(b.userId)?.name ?? null,
    }));
  },
});

const BOX_STATUSES = [
  "draft",
  "locked",
  "packed",
  "shipped",
  "delivered",
  "skipped",
  "refunded",
];

export const setBoxStatus = mutation({
  args: { boxId: v.id("boxes"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!BOX_STATUSES.includes(args.status)) {
      throw new Error(
        `Invalid status: ${args.status}. Must be one of: ${BOX_STATUSES.join(", ")}`
      );
    }
    const patch: Partial<Doc<"boxes">> = { status: args.status };
    if (args.status === "delivered") patch.deliveredAt = Date.now();
    if (args.status === "shipped") patch.shippedAt = Date.now();
    await ctx.db.patch(args.boxId, patch);
    return args.boxId;
  },
});

// ──────────────────────────────────────────────────────────────
// Shop orders (one-off purchases)
// ──────────────────────────────────────────────────────────────

export const listShopOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db
      .query("shopOrders")
      .order("desc")
      .take(LIST_LIMIT);
    const um = await buildUserMap(ctx);
    return orders.map((o) => ({
      ...o,
      userEmail: um.get(o.userId)?.email ?? null,
      userName: um.get(o.userId)?.name ?? null,
    }));
  },
});

export const getShopOrderItems = query({
  args: { orderId: v.id("shopOrders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("shopOrderItems")
      .withIndex("by_order", (q) => q.eq("shopOrderId", args.orderId))
      .collect();
  },
});

const SHOP_ORDER_STATUSES = ["paid", "fulfilled", "cancelled"];

export const setShopOrderStatus = mutation({
  args: { orderId: v.id("shopOrders"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!SHOP_ORDER_STATUSES.includes(args.status)) {
      throw new Error(
        `Invalid status: ${args.status}. Must be one of: ${SHOP_ORDER_STATUSES.join(", ")}`
      );
    }
    await ctx.db.patch(args.orderId, { status: args.status });
    return args.orderId;
  },
});

// ──────────────────────────────────────────────────────────────
// Delivery zones
// ──────────────────────────────────────────────────────────────

export const listDeliveryZones = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("deliveryZones").take(LIST_LIMIT);
  },
});

export const setDeliveryZoneActive = mutation({
  args: { zoneId: v.id("deliveryZones"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.zoneId, { active: args.active });
    return args.zoneId;
  },
});

// ──────────────────────────────────────────────────────────────
// Marketing - newsletter, referrals, gifts
// ──────────────────────────────────────────────────────────────

export const listNewsletter = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("newsletterSubscribers")
      .order("desc")
      .take(LIST_LIMIT);
  },
});

export const removeNewsletterSubscriber = mutation({
  args: { id: v.id("newsletterSubscribers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listReferrals = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const referrals = await ctx.db
      .query("referrals")
      .order("desc")
      .take(LIST_LIMIT);
    const um = await buildUserMap(ctx);
    return referrals.map((r) => ({
      ...r,
      referrerEmail: um.get(r.referrerUserId)?.email ?? null,
    }));
  },
});

const GIFT_STATUSES = [
  "pending",
  "paid",
  "delivered",
  "cancelled",
  "refunded",
];

export const setGiftStatus = mutation({
  args: { id: v.id("giftSubscriptions"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!GIFT_STATUSES.includes(args.status)) {
      throw new Error(
        `Invalid status: ${args.status}. Must be one of: ${GIFT_STATUSES.join(", ")}`
      );
    }
    const patch: Partial<Doc<"giftSubscriptions">> = { status: args.status };
    if (args.status === "delivered") patch.deliveredAt = Date.now();
    if (args.status === "paid") patch.paidAt = Date.now();
    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

// ──────────────────────────────────────────────────────────────
// System Settings (Purchase Types & Store Feature Toggles)
// ──────────────────────────────────────────────────────────────

const DISABLED_PURCHASE_TYPES_KEY = "disabledPurchaseTypes";

export const getDisabledPurchaseTypes = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const row = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", DISABLED_PURCHASE_TYPES_KEY))
      .unique();
    if (!row || !row.value) return [];
    try {
      return JSON.parse(row.value);
    } catch {
      return [];
    }
  },
});

export const setDisabledPurchaseTypes = mutation({
  args: { disabled: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", DISABLED_PURCHASE_TYPES_KEY))
      .unique();
    const valStr = JSON.stringify(args.disabled);
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: valStr,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("appSettings", {
        key: DISABLED_PURCHASE_TYPES_KEY,
        value: valStr,
        updatedAt: Date.now(),
      });
    }
    return args.disabled;
  },
});

