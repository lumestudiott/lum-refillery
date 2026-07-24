import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    try {
      const promos = await ctx.db
        .query("promotions")
        .withIndex("by_active", (q) => q.eq("active", true))
        .take(20);
      return promos ?? [];
    } catch (error) {
      console.warn("Failed to fetch active promotions:", error);
      return [];
    }
  },
});

/** Admin: list all promotions. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("promotions").order("desc").take(100);
  },
});

/** Admin: create or update a promotion. */
export const upsert = mutation({
  args: {
    id: v.optional(v.id("promotions")),
    name: v.string(),
    description: v.string(),
    discountPercent: v.number(),
    promoCode: v.optional(v.string()),
    maxUsesPerUser: v.optional(v.number()),
    bannerText: v.optional(v.string()),
    active: v.optional(v.boolean()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Promotion name is required.");
    if (args.discountPercent < 0 || args.discountPercent > 100) {
      throw new Error("Discount must be between 0 and 100%.");
    }

    const code = args.promoCode?.trim().toUpperCase() || undefined;

    if (args.id) {
      await ctx.db.patch(args.id, {
        name,
        description: args.description.trim(),
        discountPercent: args.discountPercent,
        promoCode: code,
        maxUsesPerUser: args.maxUsesPerUser,
        bannerText: args.bannerText?.trim() || undefined,
        active: args.active ?? true,
        startDate: args.startDate,
        endDate: args.endDate,
      });
      return args.id;
    }

    return await ctx.db.insert("promotions", {
      name,
      description: args.description.trim(),
      discountPercent: args.discountPercent,
      promoCode: code,
      maxUsesPerUser: args.maxUsesPerUser,
      bannerText: args.bannerText?.trim() || undefined,
      active: args.active ?? true,
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: Date.now(),
    });
  },
});

/** Admin: delete a promotion. */
export const remove = mutation({
  args: { id: v.id("promotions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/** Admin: toggle a promotion's active state. */
export const setActive = mutation({
  args: { id: v.id("promotions"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { active: args.active });
    return args.id;
  },
});

/**
 * Public: validate a promo code.
 * Returns the matching active promotion (with discountPercent) or null.
 */
export const validatePromoCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    if (!code) return null;

    const activePromos = await ctx.db
      .query("promotions")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(20);

    const now = Date.now();
    const match = activePromos.find((p) => {
      if (p.promoCode !== code) return false;
      if (p.startDate && now < p.startDate) return false;
      if (p.endDate && now > p.endDate) return false;
      return true;
    });

    if (!match) return null;
    return {
      id: match._id,
      name: match.name,
      discountPercent: match.discountPercent,
      maxUsesPerUser: match.maxUsesPerUser ?? 1,
    };
  },
});

/**
 * Check how many times a user has redeemed a specific promotion.
 * Called server-side at checkout to enforce per-user limits.
 */
export const countRedemptions = query({
  args: {
    userId: v.id("users"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, args) => {
    const redemptions = await ctx.db
      .query("promoRedemptions")
      .withIndex("by_user_promo", (q) =>
        q.eq("userId", args.userId).eq("promotionId", args.promotionId)
      )
      .take(100);
    return redemptions.length;
  },
});

/**
 * Record a promo code redemption after checkout session is completed.
 * Called internally by the Stripe webhook.
 */
export const recordRedemptionInternal = internalMutation({
  args: {
    clerkId: v.string(),
    promotionId: v.id("promotions"),
    promoCode: v.string(),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
      
    if (!user) {
      console.warn("recordRedemptionInternal: User not found for clerkId", args.clerkId);
      return null;
    }

    return await ctx.db.insert("promoRedemptions", {
      userId: user._id,
      promotionId: args.promotionId,
      promoCode: args.promoCode.toUpperCase(),
      stripeSessionId: args.stripeSessionId,
      createdAt: Date.now(),
    });
  },
});
