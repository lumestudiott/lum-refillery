import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthedUser, getAuthedUserOrNull } from "./lib/auth";
import { TT_COUNTRY_CODE, isValidTTRegion } from "./lib/regions";

/**
 * List the authenticated user's addresses, primary first.
 */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return [];
    
    const rows = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return rows.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  },
});

/**
 * Add a new address for the current user. If `setPrimary` is true (or
 * this is the user's first address), un-flag any other primary first.
 */
export const add = mutation({
  args: {
    label: v.optional(v.string()),
    line1: v.string(),
    line2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    deliveryInstructions: v.optional(v.string()),
    setPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);

    // ── Trinidad & Tobago only ──────────────────────────────────
    // Enforced server-side so the restriction can't be bypassed by
    // calling the mutation directly.
    const country = args.country ?? TT_COUNTRY_CODE;
    if (country !== TT_COUNTRY_CODE) {
      throw new Error(
        "Lumë Refillery currently delivers only within Trinidad & Tobago."
      );
    }
    if (!isValidTTRegion(args.state)) {
      throw new Error(
        "Please choose a valid Trinidad & Tobago region for your delivery address."
      );
    }

    const existing = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const shouldBePrimary = args.setPrimary === true || existing.length === 0;

    if (shouldBePrimary) {
      for (const row of existing) {
        if (row.isPrimary) {
          await ctx.db.patch(row._id, { isPrimary: false });
        }
      }
    }

    const id = await ctx.db.insert("addresses", {
      userId: user._id,
      label: args.label,
      line1: args.line1,
      line2: args.line2,
      city: args.city,
      state: args.state,
      zip: args.zip,
      country: TT_COUNTRY_CODE,
      deliveryInstructions: args.deliveryInstructions,
      isPrimary: shouldBePrimary,
      createdAt: Date.now(),
    });
    return id;
  },
});

/**
 * Promote an address to the user's primary, demoting the previous one.
 * Ownership-checked.
 */
export const setPrimary = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    const target = await ctx.db.get(args.addressId);
    if (!target) throw new Error("Address not found");
    if (target.userId !== user._id) {
      throw new Error("Unauthorized — not your address");
    }

    const others = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const row of others) {
      if (row._id !== target._id && row.isPrimary) {
        await ctx.db.patch(row._id, { isPrimary: false });
      }
    }
    await ctx.db.patch(target._id, { isPrimary: true });
    return target._id;
  },
});

export const remove = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    const target = await ctx.db.get(args.addressId);
    if (!target) return null;
    if (target.userId !== user._id) {
      throw new Error("Unauthorized — not your address");
    }
    await ctx.db.delete(target._id);
    return target._id;
  },
});

/**
 * Public read of a primary address by user id — used by box generator.
 * Defaults to null if the user has no addresses.
 */
export const getPrimaryForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUser(ctx);
    return await ctx.db
      .query("addresses")
      .withIndex("by_user_primary", (q) =>
        q.eq("userId", user._id).eq("isPrimary", true)
      )
      .unique();
  },
});
