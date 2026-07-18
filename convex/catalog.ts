import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/**
 * The editable product-category taxonomy (the SKU pillars). Categories live
 * in the DB so admins can add/edit/remove them without a developer. The 6
 * defaults are seeded on first use; SKU prefixes come from each category's
 * `code`.
 */

const ATTRIBUTE_SETS = ["food", "home"];

/** Seed data - mirrors the historical hardcoded pillars. */
const DEFAULT_CATEGORIES = [
  {
    code: "FP",
    label: "Food Pantry",
    description: "Dry goods, grains, baking staples, spices, oils, sauces & condiments.",
    attributeSet: "food",
    units: ["g", "kg", "ml", "L", "ea", "pk"],
  },
  {
    code: "GP",
    label: "Ground Provisions & Fresh",
    description: "Roots, tubers, local fresh produce & fruits.",
    attributeSet: "food",
    units: ["lb", "kg", "g", "ea", "pk"],
  },
  {
    code: "SN",
    label: "Snacks & Beverages",
    description: "Prepared snacks, chips, packaged teas, juices & coffee.",
    attributeSet: "food",
    units: ["g", "ml", "L", "ea", "pk"],
  },
  {
    code: "FR",
    label: "Fresh Chilled",
    description: "Meats, seafood, dairy, eggs & anything needing refrigeration.",
    attributeSet: "food",
    units: ["lb", "kg", "g", "ea", "pk"],
  },
  {
    code: "BK",
    label: "Bakery",
    description: "Fresh breads, artisanal loaves & baked goods.",
    attributeSet: "food",
    units: ["ea", "pk", "pc"],
  },
  {
    code: "HK",
    label: "Home & Kitchen",
    description: "Eco cleaning, cookware, pots, pans & zero-waste kitchen tools.",
    attributeSet: "home",
    units: ["ea", "pc", "pk", "ml", "L"],
  },
];

async function seedIfEmpty(ctx: MutationCtx) {
  const existing = await ctx.db.query("productCategories").take(1);
  if (existing.length > 0) return;
  let sortOrder = 0;
  for (const c of DEFAULT_CATEGORIES) {
    await ctx.db.insert("productCategories", { ...c, sortOrder, active: true });
    sortOrder += 1;
  }
}

/** Idempotent - ensures the default pillars exist. Called on admin load. */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await seedIfEmpty(ctx);
  },
});

/** List every category (admin), ordered for display. */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const cats = await ctx.db.query("productCategories").collect();
    return cats.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

/** Create or update a category. Omit `id` to create. */
export const upsertCategory = mutation({
  args: {
    id: v.optional(v.id("productCategories")),
    code: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    attributeSet: v.string(),
    units: v.array(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await seedIfEmpty(ctx);

    const code = normalizeCode(args.code);
    if (code.length < 2 || code.length > 3) {
      throw new Error("Category code must be 2–3 letters (A–Z).");
    }
    const label = args.label.trim();
    if (!label) throw new Error("Category name is required.");
    if (!ATTRIBUTE_SETS.includes(args.attributeSet)) {
      throw new Error("Attribute set must be 'food' or 'home'.");
    }
    const units = args.units.map((u) => u.trim()).filter(Boolean);
    if (units.length === 0) throw new Error("Pick at least one unit.");

    // Enforce unique code.
    const clash = await ctx.db
      .query("productCategories")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (clash && clash._id !== args.id) {
      throw new Error(`Code "${code}" is already used by ${clash.label}.`);
    }

    if (args.id) {
      const current = await ctx.db.get(args.id);
      if (!current) throw new Error("Category not found.");
      await ctx.db.patch(args.id, {
        code,
        label,
        description: args.description?.trim() || undefined,
        attributeSet: args.attributeSet,
        units,
        active: args.active ?? current.active,
      });
      return args.id;
    }

    const all = await ctx.db.query("productCategories").collect();
    const sortOrder = all.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;
    return await ctx.db.insert("productCategories", {
      code,
      label,
      description: args.description?.trim() || undefined,
      attributeSet: args.attributeSet,
      units,
      sortOrder,
      active: args.active ?? true,
    });
  },
});

/** Delete a category - blocked while any product still uses its code. */
export const deleteCategory = mutation({
  args: { id: v.id("productCategories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cat = await ctx.db.get(args.id);
    if (!cat) return args.id;
    const inUse = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", cat.code))
      .first();
    if (inUse) {
      throw new Error(
        `Can't delete "${cat.label}" - products still use it. Move them first.`
      );
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
