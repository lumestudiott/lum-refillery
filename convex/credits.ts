import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthedUser, getAuthedUserOrNull, requireAdmin } from "./lib/auth";

/**
 * Internal helper — append a credit transaction AND patch the
 * denormalized `users.creditsCents` balance. Always call together.
 */
async function applyCreditChange(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    amountCents: number;
    reason: string;
    boxId?: Id<"boxes">;
    referralId?: Id<"referrals">;
    note?: string;
  }
) {
  const user = await ctx.db.get(args.userId);
  if (!user) throw new Error("User not found");

  const newBalance = (user.creditsCents ?? 0) + args.amountCents;
  if (newBalance < 0) {
    throw new Error("Insufficient credit balance");
  }

  const txId = await ctx.db.insert("creditTransactions", {
    userId: args.userId,
    amountCents: args.amountCents,
    reason: args.reason,
    boxId: args.boxId,
    referralId: args.referralId,
    note: args.note,
    createdAt: Date.now(),
  });
  await ctx.db.patch(args.userId, { creditsCents: newBalance });
  return txId;
}

/**
 * INTERNAL — grant credits (referral bonus, promo, refund, admin adjust).
 */
export const grant = internalMutation({
  args: {
    userId: v.id("users"),
    amountCents: v.number(),
    reason: v.string(),
    boxId: v.optional(v.id("boxes")),
    referralId: v.optional(v.id("referrals")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.amountCents <= 0) throw new Error("amountCents must be > 0");
    return await applyCreditChange(ctx, args);
  },
});

/**
 * INTERNAL — apply credits against a box (called during box finalization).
 */
export const applyToBox = internalMutation({
  args: {
    userId: v.id("users"),
    boxId: v.id("boxes"),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amountCents <= 0) throw new Error("amountCents must be > 0");
    return await applyCreditChange(ctx, {
      userId: args.userId,
      amountCents: -args.amountCents,
      reason: "applied_to_box",
      boxId: args.boxId,
    });
  },
});

/**
 * Admin: manually adjust a user's balance.
 */
export const adminAdjust = mutation({
  args: {
    userId: v.id("users"),
    amountCents: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await applyCreditChange(ctx, {
      userId: args.userId,
      amountCents: args.amountCents,
      reason: "admin_adjust",
      note: args.note,
    });
  },
});

// ─── Public read API ───────────────────────────────────────────────
export const getMyBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUserOrNull(ctx);
    return { cents: user?.creditsCents ?? 0 };
  },
});

export const getMyHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUser(ctx);
    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});
