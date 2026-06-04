import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/auth";

const attributesValidator = v.optional(
  v.object({
    organic: v.optional(v.boolean()),
    local: v.optional(v.boolean()),
    glutenFree: v.optional(v.boolean()),
    dairyFree: v.optional(v.boolean()),
    vegan: v.optional(v.boolean()),
    nutFree: v.optional(v.boolean()),
  })
);

/**
 * Public catalog listing — active products only, optionally filtered by
 * category. Uses built-in Convex pagination to smoothly load catalog pages.
 */
export const listActive = query({
  args: { 
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const cat = args.category;
      return await ctx.db
        .query("products")
        .withIndex("by_active_and_category", (q) =>
          q.eq("active", true).eq("category", cat)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .paginate(args.paginationOpts);
  },
});

/**
 * Bounded public catalog snapshot for server-rendered shop pages. This avoids
 * turning every anonymous catalog visit into a live reactive subscription.
 */
export const listActiveSnapshot = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 36, 60);
    if (args.category) {
      return await ctx.db
        .query("products")
        .withIndex("by_active_and_category", (q) =>
          q.eq("active", true).eq("category", args.category!)
        )
        .take(limit);
    }
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(limit);
  },
});

/**
 * Full-text search over active products.
 */
export const searchActive = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    
    if (args.category) {
      return await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) =>
          q.search("name", args.query)
           .eq("active", true)
           .eq("category", args.category!)
        )
        .take(limit);
    }
    
    return await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) =>
        q.search("name", args.query)
         .eq("active", true)
      )
      .take(limit);
  },
});

export const getBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique(),
});

export const getManyBySku = query({
  args: { skus: v.array(v.string()) },
  handler: async (ctx, args) => {
    const products = await Promise.all(
      args.skus.map((sku) =>
        ctx.db
          .query("products")
          .withIndex("by_sku", (q) => q.eq("sku", sku))
          .unique()
      )
    );
    // Filter out nulls in case some SKUs don't exist
    return products.filter((p) => p !== null);
  },
});

// ─── Admin write API ───────────────────────────────────────────────
export const upsertProduct = mutation({
  args: {
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    unit: v.string(),
    weightGrams: v.optional(v.number()),
    basePriceCents: v.number(),
    imageUrl: v.optional(v.string()),
    attributes: attributesValidator,
    sourcingPartner: v.optional(v.string()),
    sourcingOrigin: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    defaultForTiers: v.optional(v.array(v.string())),
    purchaseType: v.optional(v.string()),
    subscriptionIntervals: v.optional(v.array(v.string())),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await upsertImpl(ctx, args);
  },
});

/**
 * INTERNAL — for seed scripts.
 */
export const internalUpsertProduct = internalMutation({
  args: {
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    unit: v.string(),
    weightGrams: v.optional(v.number()),
    basePriceCents: v.number(),
    imageUrl: v.optional(v.string()),
    attributes: attributesValidator,
    sourcingPartner: v.optional(v.string()),
    sourcingOrigin: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    defaultForTiers: v.optional(v.array(v.string())),
    purchaseType: v.optional(v.string()),
    subscriptionIntervals: v.optional(v.array(v.string())),
    active: v.boolean(),
  },
  handler: async (ctx, args) => await upsertImpl(ctx, args),
});

async function upsertImpl(
  ctx: MutationCtx,
  args: {
    sku: string;
    name: string;
    description?: string;
    category: string;
    unit: string;
    weightGrams?: number;
    basePriceCents: number;
    imageUrl?: string;
    attributes?:
      | {
          organic?: boolean;
          local?: boolean;
          glutenFree?: boolean;
          dairyFree?: boolean;
          vegan?: boolean;
          nutFree?: boolean;
        }
      | undefined;
    sourcingPartner?: string;
    sourcingOrigin?: string;
    tags?: string[];
    defaultForTiers?: string[];
    purchaseType?: string;
    subscriptionIntervals?: string[];
    active: boolean;
  }
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_sku", (q) => q.eq("sku", args.sku))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, args);
    return existing._id;
  }
  return await ctx.db.insert("products", {
    ...args,
    createdAt: Date.now(),
  });
}
