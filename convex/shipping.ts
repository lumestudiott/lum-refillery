import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/auth";

/**
 * Admin: hand a `locked` (or `paid`) box off to fulfillment / carrier.
 * Stub for now — real impl would create a shipping label via EasyPost /
 * Shippo / Stripe Shipping and persist the tracking URL.
 */
export const shipBox = mutation({
  args: {
    boxId: v.id("boxes"),
    carrier: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await shipImpl(ctx, args);
  },
});

/**
 * INTERNAL — same operation invokable from automation (e.g. a future
 * cron that auto-ships paid boxes once they're packed).
 */
export const internalShipBox = internalMutation({
  args: {
    boxId: v.id("boxes"),
    carrier: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => await shipImpl(ctx, args),
});

async function shipImpl(
  ctx: MutationCtx,
  args: {
    boxId: Id<"boxes">;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  }
) {
  const box = await ctx.db.get(args.boxId);
  if (!box) throw new Error("Box not found");
  if (box.status === "shipped" || box.status === "delivered") {
    return box._id;
  }
  if (box.status !== "locked" && box.status !== "packed") {
    throw new Error(`Cannot ship a box with status=${box.status}`);
  }

  await ctx.db.patch(box._id, {
    status: "shipped",
    carrier: args.carrier ?? box.carrier,
    trackingNumber: args.trackingNumber,
    trackingUrl: args.trackingUrl,
    shippedAt: Date.now(),
  });

  // Best-effort: if this is the user's first shipped box and they were
  // referred, fire the conversion. Failures are non-fatal.
  await ctx.scheduler.runAfter(0, internal.shipping.maybeConvertReferral, {
    boxId: box._id,
  });

  return box._id;
}

/**
 * INTERNAL — invoked after a ship event. Looks up the recipient's
 * `referredByUserId` chain and converts any pending referral row.
 */
export const maybeConvertReferral = internalMutation({
  args: { boxId: v.id("boxes") },
  handler: async (ctx, args) => {
    const box = await ctx.db.get(args.boxId);
    if (!box) return null;
    const user = await ctx.db.get(box.userId);
    if (!user) return null;

    // Has any shipped box besides this one? If so, not the first.
    const previousShipped = await ctx.db
      .query("boxes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(50);
    const otherShipped = previousShipped.find(
      (b) =>
        b._id !== box._id &&
        (b.status === "shipped" || b.status === "delivered")
    );
    if (otherShipped) return null;

    // Find an open referral linking this user.
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referee_email", (q) => q.eq("refereeEmail", user.email))
      .collect();
    const open = referrals.find(
      (r) => r.status === "registered" || r.status === "sent"
    );
    if (!open) return null;

    await ctx.runMutation(internal.referrals.markConverted, {
      referralId: open._id,
    });
    return open._id;
  },
});
