import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/auth";
import { skuPrefixForCategory } from "./lib/productCategories";

const attributesValidator = v.optional(
  v.object({
    organic: v.optional(v.boolean()),
    local: v.optional(v.boolean()),
    glutenFree: v.optional(v.boolean()),
    dairyFree: v.optional(v.boolean()),
    vegan: v.optional(v.boolean()),
    nutFree: v.optional(v.boolean()),
    sustainableMaterial: v.optional(v.boolean()),
    reusable: v.optional(v.boolean()),
    plasticFree: v.optional(v.boolean()),
    foodSafe: v.optional(v.boolean()),
    upcycled: v.optional(v.boolean()),
  })
);

/**
 * Public catalog listing - active products only, optionally filtered by
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
/** Public: distinct brands across active products (for the homepage scroller). */
export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(500);
    const brands = new Set<string>();
    for (const p of active) {
      if (p.brand?.trim()) brands.add(p.brand.trim());
    }
    return [...brands].sort();
  },
});

export const listActiveSnapshot = query({
  args: {
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 36, 60);
    const active = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(500);
    // Nav tabs pass shopCategorySlug; older products may only have the
    // legacy category code, so match either.
    const matches = active.filter((p) => {
      if (
        args.category &&
        p.shopCategorySlug !== args.category &&
        p.category !== args.category
      ) {
        return false;
      }
      if (args.subcategory && p.shopSubcategorySlug !== args.subcategory) {
        return false;
      }
      return true;
    });
    return matches.slice(0, limit);
  },
});

/**
 * Full-text search over active products.
 */
export const searchActive = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    const hits = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) =>
        q.search("name", args.query).eq("active", true)
      )
      .take(100);
    // Post-filter so category matches either shopCategorySlug or the
    // legacy category code (see listActiveSnapshot).
    const matches = hits.filter((p) => {
      if (
        args.category &&
        p.shopCategorySlug !== args.category &&
        p.category !== args.category
      ) {
        return false;
      }
      if (args.subcategory && p.shopSubcategorySlug !== args.subcategory) {
        return false;
      }
      return true;
    });
    return matches.slice(0, limit);
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

// ─── Stock management (Shopify-style on-hand count) ─────────────────
/**
 * Admin: nudge on-hand stock up or down (e.g. the +/- steppers in the
 * catalogue table). Never goes below zero. Returns the new quantity.
 */
export const adjustStock = mutation({
  args: { productId: v.id("products"), delta: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    const next = Math.max(0, Math.round((product.stockQuantity ?? 0) + args.delta));
    await ctx.db.patch(args.productId, { stockQuantity: next });
    return next;
  },
});

/** Admin: set on-hand stock to an exact number (inline edit / restock). */
export const setStock = mutation({
  args: { productId: v.id("products"), stockQuantity: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const qty = Math.max(0, Math.round(args.stockQuantity));
    await ctx.db.patch(args.productId, { stockQuantity: qty });
    return qty;
  },
});

// ─── Admin write API ───────────────────────────────────────────────

const optionsValidator = v.optional(
  v.array(v.object({ name: v.string(), values: v.array(v.string()) }))
);

const imagesValidator = v.optional(
  v.array(v.object({ url: v.string(), alt: v.optional(v.string()) }))
);

const upsertArgs = {
  sku: v.optional(v.string()),
  name: v.string(),
  brand: v.optional(v.string()),
  description: v.optional(v.string()),
  category: v.string(),
  shopCategorySlug: v.optional(v.string()),
  shopSubcategorySlug: v.optional(v.string()),
  unit: v.string(),
  unitType: v.optional(v.string()),
  weightGrams: v.optional(v.number()),
  basePriceCents: v.number(),
  discountTier: v.optional(v.string()),
  customDiscountPercent: v.optional(v.number()),
  stockQuantity: v.optional(v.number()),
  trackInventory: v.optional(v.boolean()),
  lowStockThreshold: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  images: imagesValidator,
  videoUrl: v.optional(v.string()),
  attributes: attributesValidator,
  depositCents: v.optional(v.number()),
  sourcingPartner: v.optional(v.string()),
  sourcingOrigin: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  defaultForTiers: v.optional(v.array(v.string())),
  purchaseType: v.optional(v.string()),
  subscriptionIntervals: v.optional(v.array(v.string())),
  options: optionsValidator,
  active: v.boolean(),
};

export const upsertProduct = mutation({
  args: upsertArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await upsertImpl(ctx, args);
  },
});

/**
 * INTERNAL - for seed scripts.
 */
export const internalUpsertProduct = internalMutation({
  args: upsertArgs,
  handler: async (ctx, args) => await upsertImpl(ctx, args),
});

async function upsertImpl(
  ctx: MutationCtx,
  args: {
    sku?: string;
    name: string;
    brand?: string;
    description?: string;
    category: string;
    shopCategorySlug?: string;
    shopSubcategorySlug?: string;
    unit: string;
    unitType?: string;
    weightGrams?: number;
    basePriceCents: number;
    discountTier?: string;
    customDiscountPercent?: number;
    stockQuantity?: number;
    trackInventory?: boolean;
    lowStockThreshold?: number;
    imageUrl?: string;
    images?: Array<{ url: string; alt?: string }>;
    videoUrl?: string;
    attributes?: {
      organic?: boolean;
      local?: boolean;
      glutenFree?: boolean;
      dairyFree?: boolean;
      vegan?: boolean;
      nutFree?: boolean;
      sustainableMaterial?: boolean;
      reusable?: boolean;
      plasticFree?: boolean;
      foodSafe?: boolean;
      upcycled?: boolean;
    };
    depositCents?: number;
    sourcingPartner?: string;
    sourcingOrigin?: string;
    tags?: string[];
    defaultForTiers?: string[];
    purchaseType?: string;
    subscriptionIntervals?: string[];
    options?: Array<{ name: string; values: string[] }>;
    active: boolean;
  }
) {
  const providedSku = args.sku?.trim();

  if (providedSku) {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", providedSku))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, sku: providedSku });
      return existing._id;
    }
    return await ctx.db.insert("products", {
      ...args,
      sku: providedSku,
      createdAt: Date.now(),
    });
  }

  // No SKU supplied → auto-generate a product number, e.g. "GP-0007".
  const sku = await nextSku(ctx, args.category);
  return await ctx.db.insert("products", {
    ...args,
    sku,
    createdAt: Date.now(),
  });
}

/**
 * Atomically allocate the next product number. Runs inside the mutation
 * transaction, so concurrent creates never collide. Format: PREFIX-NNNN.
 */
async function nextSku(ctx: MutationCtx, category: string): Promise<string> {
  const prefix = skuPrefixForCategory(category);
  const row = await ctx.db
    .query("appSettings")
    .withIndex("by_key", (q) => q.eq("key", "productSeq"))
    .unique();
  const next = (row ? parseInt(row.value, 10) || 0 : 0) + 1;
  if (row) {
    await ctx.db.patch(row._id, { value: String(next), updatedAt: Date.now() });
  } else {
    await ctx.db.insert("appSettings", {
      key: "productSeq",
      value: String(next),
      updatedAt: Date.now(),
    });
  }
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

// ─── Image upload (Convex file storage) ─────────────────────────────
/** Admin: get a one-time upload URL to POST an image file to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Admin: resolve a stored file's public URL after upload. */
export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ─── Variant CRUD (Shopify-style options + purchasable combos) ─────

/** Public: fetch all active variants for a product. */
export const listVariants = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productVariants")
      .withIndex("by_product_active", (q) =>
        q.eq("productId", args.productId).eq("active", true)
      )
      .take(100);
  },
});

/** Admin: fetch ALL variants for a product (including inactive). */
export const listAllVariants = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .take(200);
  },
});

/** Admin: create or update a variant. Omit `id` to create. */
export const upsertVariant = mutation({
  args: {
    id: v.optional(v.id("productVariants")),
    productId: v.id("products"),
    sku: v.string(),
    optionValues: v.record(v.string(), v.string()),
    priceCents: v.number(),
    stockQuantity: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
    lowStockThreshold: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    if (args.id) {
      await ctx.db.patch(args.id, {
        sku: args.sku,
        optionValues: args.optionValues,
        priceCents: args.priceCents,
        stockQuantity: args.stockQuantity,
        trackInventory: args.trackInventory,
        lowStockThreshold: args.lowStockThreshold,
        active: args.active ?? true,
      });
      return args.id;
    }

    return await ctx.db.insert("productVariants", {
      productId: args.productId,
      sku: args.sku,
      optionValues: args.optionValues,
      priceCents: args.priceCents,
      stockQuantity: args.stockQuantity,
      trackInventory: args.trackInventory,
      lowStockThreshold: args.lowStockThreshold,
      imageUrl: undefined,
      active: args.active ?? true,
      createdAt: Date.now(),
    });
  },
});

/** Admin: delete a variant. */
export const deleteVariant = mutation({
  args: { id: v.id("productVariants") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/** Admin: batch-save all variants for a product (replaces existing set). */
export const saveVariants = mutation({
  args: {
    productId: v.id("products"),
    variants: v.array(
      v.object({
        id: v.optional(v.id("productVariants")),
        sku: v.string(),
        optionValues: v.record(v.string(), v.string()),
        priceCents: v.number(),
        stockQuantity: v.optional(v.number()),
        trackInventory: v.optional(v.boolean()),
        lowStockThreshold: v.optional(v.number()),
        active: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const existing = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .take(200);

    const incomingIds = new Set(
      args.variants.filter((v) => v.id).map((v) => v.id!)
    );

    // Delete variants that are no longer in the incoming set
    for (const old of existing) {
      if (!incomingIds.has(old._id)) {
        await ctx.db.delete(old._id);
      }
    }

    // Upsert each variant
    for (const variant of args.variants) {
      if (variant.id) {
        await ctx.db.patch(variant.id, {
          sku: variant.sku,
          optionValues: variant.optionValues,
          priceCents: variant.priceCents,
          stockQuantity: variant.stockQuantity,
          trackInventory: variant.trackInventory,
          lowStockThreshold: variant.lowStockThreshold,
          active: variant.active ?? true,
        });
      } else {
        await ctx.db.insert("productVariants", {
          productId: args.productId,
          sku: variant.sku,
          optionValues: variant.optionValues,
          priceCents: variant.priceCents,
          stockQuantity: variant.stockQuantity,
          trackInventory: variant.trackInventory,
          lowStockThreshold: variant.lowStockThreshold,
          imageUrl: undefined,
          active: variant.active ?? true,
          createdAt: Date.now(),
        });
      }
    }
  },
});

/** Public: get a single variant by its SKU. */
export const getVariantBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productVariants")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
  },
});
