import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Public: list all active parent categories with their subcategories. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("shopCategories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const parents = all
      .filter((c) => !c.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return parents.map((p) => ({
      ...p,
      subcategories: all
        .filter((c) => c.parentId === p._id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },
});

/** Admin: list every category (including inactive). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("shopCategories").collect();
    const parents = all
      .filter((c) => !c.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return parents.map((p) => ({
      ...p,
      subcategories: all
        .filter((c) => c.parentId === p._id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },
});

/** Admin: create or update a shop category. */
export const upsert = mutation({
  args: {
    id: v.optional(v.id("shopCategories")),
    label: v.string(),
    slug: v.optional(v.string()),
    parentId: v.optional(v.id("shopCategories")),
    active: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const label = args.label.trim();
    if (!label) throw new Error("Category name is required.");
    const slug = args.slug?.trim() || slugify(label);

    const clash = await ctx.db
      .query("shopCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (clash && clash._id !== args.id) {
      throw new Error(`Slug "${slug}" is already in use.`);
    }

    if (args.id) {
      await ctx.db.patch(args.id, {
        label,
        slug,
        parentId: args.parentId,
        active: args.active ?? true,
        ...(args.sortOrder != null ? { sortOrder: args.sortOrder } : {}),
      });
      return args.id;
    }

    const all = await ctx.db.query("shopCategories").collect();
    const siblings = all.filter((c) =>
      args.parentId ? c.parentId === args.parentId : !c.parentId
    );
    const sortOrder =
      args.sortOrder ??
      siblings.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;

    return await ctx.db.insert("shopCategories", {
      label,
      slug,
      parentId: args.parentId,
      sortOrder,
      active: args.active ?? true,
      createdAt: Date.now(),
    });
  },
});

/** Admin: delete a shop category. Deletes children too. */
export const remove = mutation({
  args: { id: v.id("shopCategories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const children = await ctx.db
      .query("shopCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();
    for (const child of children) {
      await ctx.db.delete(child._id);
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/** Admin: seed the default shop categories if empty. */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("shopCategories").take(1);
    if (existing.length > 0) return;

    const defaults = [
      {
        label: "All",
        slug: "all",
        subs: ["Featured Curations", "New Arrivals", "Best Sellers"],
      },
      {
        label: "Hauls",
        slug: "hauls",
        subs: ["Weekly Hauls", "Family Hauls", "Starter Hauls"],
      },
      {
        label: "Beverages",
        slug: "beverages",
        subs: [
          "Water & Seltzer",
          "Juice",
          "Kombucha",
          "Coffee",
          "Tea",
          "Functional Sodas",
          "Non-Alcoholic",
        ],
      },
      {
        label: "Personal Care",
        slug: "personal-care",
        subs: [
          "Body",
          "Hair",
          "Face",
          "Oral Care",
          "Deodorant",
          "Home & Cleaning",
        ],
      },
      {
        label: "Household",
        slug: "household",
        subs: [],
      },
    ];

    let parentOrder = 0;
    for (const cat of defaults) {
      const parentId = await ctx.db.insert("shopCategories", {
        label: cat.label,
        slug: cat.slug,
        parentId: undefined,
        sortOrder: parentOrder++,
        active: true,
        createdAt: Date.now(),
      });
      let subOrder = 0;
      for (const sub of cat.subs) {
        await ctx.db.insert("shopCategories", {
          label: sub,
          slug: slugify(sub),
          parentId,
          sortOrder: subOrder++,
          active: true,
          createdAt: Date.now(),
        });
      }
    }
  },
});
