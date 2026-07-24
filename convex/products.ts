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

/**
 * Resolve a product page by its URL segment: try the custom slug first,
 * then fall back to the SKU (so older SKU-based links keep working).
 */
export const getBySlugOrSku = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const bySlug = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (bySlug) return bySlug;
    return await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.slug))
      .unique();
  },
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
  slug: v.optional(v.string()),
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
  producer: v.optional(
    v.object({
      name: v.optional(v.string()),
      location: v.optional(v.string()),
      text: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
    })
  ),
  storageTips: v.optional(
    v.object({
      text: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
    })
  ),
  ingredients: v.optional(
    v.object({
      text: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
    })
  ),
  attributes: attributesValidator,
  customAttributes: v.optional(v.array(v.string())),
  depositCents: v.optional(v.number()),
  sourcingPartner: v.optional(v.string()),
  sourcingOrigin: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  defaultForTiers: v.optional(v.array(v.string())),
  purchaseType: v.optional(v.string()),
  purchaseTypes: v.optional(v.array(v.string())),
  subscriptionIntervals: v.optional(v.array(v.string())),
  options: optionsValidator,
  casePricing: v.optional(
    v.object({
      caseSize: v.optional(v.number()),
      itemLabel: v.optional(v.string()),
      enableQuarter: v.optional(v.boolean()),
      quarterQty: v.optional(v.number()),
      quarterPriceCents: v.optional(v.number()),
      enableHalf: v.optional(v.boolean()),
      halfQty: v.optional(v.number()),
      halfPriceCents: v.optional(v.number()),
      enableFull: v.optional(v.boolean()),
      fullQty: v.optional(v.number()),
      fullPriceCents: v.optional(v.number()),
    })
  ),
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
    slug?: string;
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
    producer?: { name?: string; location?: string; text?: string; imageUrl?: string };
    storageTips?: { text?: string; imageUrl?: string };
    ingredients?: { text?: string; imageUrl?: string };
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
    customAttributes?: string[];
    depositCents?: number;
    sourcingPartner?: string;
    sourcingOrigin?: string;
    tags?: string[];
    defaultForTiers?: string[];
    purchaseType?: string;
    purchaseTypes?: string[];
    subscriptionIntervals?: string[];
    options?: Array<{ name: string; values: string[] }>;
    casePricing?: {
      caseSize?: number;
      itemLabel?: string;
      enableQuarter?: boolean;
      quarterQty?: number;
      quarterPriceCents?: number;
      enableHalf?: boolean;
      halfQty?: number;
      halfPriceCents?: number;
      enableFull?: boolean;
      fullQty?: number;
      fullPriceCents?: number;
    };
    active: boolean;
  }
) {
  const providedSku = args.sku?.trim();
  // Normalize the custom slug: trim, lowercase, empty → undefined.
  const slug = normalizeSlug(args.slug);

  if (providedSku) {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", providedSku))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, sku: providedSku, slug });
      return existing._id;
    }
    return await ctx.db.insert("products", {
      ...args,
      sku: providedSku,
      slug,
      createdAt: Date.now(),
    });
  }

  // No SKU supplied → auto-generate a product number, e.g. "GP-0007".
  const sku = await nextSku(ctx, args.category);
  return await ctx.db.insert("products", {
    ...args,
    sku,
    slug,
    createdAt: Date.now(),
  });
}

/** Trim/lowercase a slug and collapse whitespace to hyphens; empty → undefined. */
function normalizeSlug(raw?: string): string | undefined {
  const cleaned = raw
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned ? cleaned : undefined;
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

// Per-size case pricing (¼/½/full case, each with quantity + price).
const variantCasePricingValidator = v.optional(
  v.object({
    itemLabel: v.optional(v.string()),
    enableQuarter: v.optional(v.boolean()),
    quarterQty: v.optional(v.number()),
    quarterPriceCents: v.optional(v.number()),
    enableHalf: v.optional(v.boolean()),
    halfQty: v.optional(v.number()),
    halfPriceCents: v.optional(v.number()),
    enableFull: v.optional(v.boolean()),
    fullQty: v.optional(v.number()),
    fullPriceCents: v.optional(v.number()),
  })
);

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
    imageUrl: v.optional(v.string()),
    images: imagesValidator,
    videoUrl: v.optional(v.string()),
    casePricing: variantCasePricingValidator,
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
        imageUrl: args.imageUrl,
        images: args.images,
        videoUrl: args.videoUrl,
        casePricing: args.casePricing,
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
      imageUrl: args.imageUrl,
      images: args.images,
      videoUrl: args.videoUrl,
      casePricing: args.casePricing,
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
        imageUrl: v.optional(v.string()),
        images: imagesValidator,
        videoUrl: v.optional(v.string()),
        casePricing: variantCasePricingValidator,
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
          imageUrl: variant.imageUrl,
          images: variant.images,
          videoUrl: variant.videoUrl,
          casePricing: variant.casePricing,
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
          imageUrl: variant.imageUrl,
          images: variant.images,
          videoUrl: variant.videoUrl,
          casePricing: variant.casePricing,
          active: variant.active ?? true,
          createdAt: Date.now(),
        });
      }
    }
  },
});

// ─── Internal seed helpers (CLI: npx convex run products:…) ────────

/** INTERNAL: upload URL for seeding images from the CLI. */
export const internalGenerateUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

/** INTERNAL: resolve a stored file's public URL (seeding). */
export const internalGetImageUrl = internalMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => await ctx.storage.getUrl(args.storageId),
});

/** INTERNAL: replace a product's size variants (seeding). */
export const internalSeedVariants = internalMutation({
  args: {
    sku: v.string(),
    optionName: v.string(),
    variants: v.array(
      v.object({
        label: v.string(),
        imageUrl: v.optional(v.string()),
        priceCents: v.number(),
        casePricing: variantCasePricingValidator,
      })
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
    if (!product) throw new Error(`Product not found: ${args.sku}`);

    await ctx.db.patch(product._id, {
      options: [{ name: args.optionName, values: args.variants.map((x) => x.label) }],
    });

    const existing = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .take(200);
    for (const old of existing) await ctx.db.delete(old._id);

    for (const x of args.variants) {
      const slug = x.label
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "-")
        .replace(/[^A-Z0-9-]/g, "");
      await ctx.db.insert("productVariants", {
        productId: product._id,
        sku: `${product.sku}-${slug}`,
        optionValues: { [args.optionName]: x.label },
        priceCents: x.priceCents,
        imageUrl: x.imageUrl,
        casePricing: x.casePricing,
        active: true,
        createdAt: Date.now(),
      });
    }
    return args.variants.length;
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
