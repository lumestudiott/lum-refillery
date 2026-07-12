import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/** Admin: list all tags, ordered alphabetically. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const tags = await ctx.db.query("tags").take(500);
    return tags.sort((a, b) => a.name.localeCompare(b.name));
  },
});

/** Admin: create a tag (idempotent — returns existing if name matches). */
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Tag name is required.");

    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("tags", { name, createdAt: Date.now() });
  },
});

/** Admin: delete a tag. */
export const remove = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/** Admin: rename a tag. */
export const rename = mutation({
  args: { id: v.id("tags"), name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Tag name is required.");
    const clash = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
    if (clash && clash._id !== args.id) {
      throw new Error(`Tag "${name}" already exists.`);
    }
    await ctx.db.patch(args.id, { name });
    return args.id;
  },
});

/** Admin: seed default tags if none exist. */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("tags").take(1);
    if (existing.length > 0) return;

    const defaults = [
      "Cookware",
      "Zero Waste",
      "Pantry Staple",
      "Baking",
      "Local Sourced",
      "Root Crop",
      "Eco-Friendly",
      "New Arrival",
      "Best Seller",
      "Sale",
    ];
    for (const name of defaults) {
      await ctx.db.insert("tags", { name, createdAt: Date.now() });
    }
  },
});
