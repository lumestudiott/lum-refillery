import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/** Public: list all active promotions (for the announcement banner). */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(20);
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

    if (args.id) {
      await ctx.db.patch(args.id, {
        name,
        description: args.description.trim(),
        discountPercent: args.discountPercent,
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
