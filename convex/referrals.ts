import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthedUser, getAuthedUserOrNull } from "./lib/auth";
import { rateLimiter } from "./lib/rateLimit";

const DEFAULT_BONUS_CENTS = 2_000; // $20

function generateReferralCode(seed: string): string {
  // Deterministic 6-char base32 hash of `seed`. Good enough for codes.
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let n = Math.abs(hash);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length);
  }
  return out;
}

/**
 * Public: ensure the authenticated user has a referral code, and return it.
 */
export const getOrCreateMyCode = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUser(ctx);
    if (user.referralCode) return user.referralCode;

    // Generate and collision-check up to a few times.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateReferralCode(`${user._id}:${attempt}`);
      const taken = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", code))
        .unique();
      if (!taken) {
        await ctx.db.patch(user._id, { referralCode: code });
        return code;
      }
    }
    throw new Error("Failed to generate a unique referral code");
  },
});

/**
 * Public: invite a friend by email under your referral code. Creates a
 * pending `referrals` row. Bonus is awarded on conversion (handled by
 * `markConverted` when their first paid box ships).
 */
export const sendInvite = mutation({
  args: {
    refereeEmail: v.string(),
    bonusCents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    const email = args.refereeEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "referral", { key: user._id });
    if (!status.ok) {
      throw new Error("Rate limit exceeded for referrals. Please try again later.");
    }

    // De-dupe: if already invited and still pending, return existing.
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referee_email", (q) => q.eq("refereeEmail", email))
      .collect();
    const open = existing.find(
      (r) => r.referrerUserId === user._id && r.status === "sent"
    );
    if (open) return open._id;

    return await ctx.db.insert("referrals", {
      referrerUserId: user._id,
      refereeEmail: email,
      status: "sent",
      bonusCents: args.bonusCents ?? DEFAULT_BONUS_CENTS,
      createdAt: Date.now(),
    });
  },
});

/**
 * INTERNAL — link a referral when the referee signs up (called from
 * `users.createUser`). Best-effort, never throws.
 */
export const linkOnSignup = internalMutation({
  args: {
    refereeUserId: v.id("users"),
    refereeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.refereeEmail.trim().toLowerCase();
    if (!email) return null;
    const matches = await ctx.db
      .query("referrals")
      .withIndex("by_referee_email", (q) => q.eq("refereeEmail", email))
      .collect();
    const pending = matches.find((r) => r.status === "sent");
    if (!pending) return null;
    await ctx.db.patch(pending._id, {
      refereeUserId: args.refereeUserId,
      status: "registered",
    });
    await ctx.db.patch(args.refereeUserId, {
      referredByUserId: pending.referrerUserId,
    });
    return pending._id;
  },
});

/**
 * INTERNAL — called when a referred user's first box ships. Awards the
 * referrer credit and marks the referral converted.
 */
export const markConverted = internalMutation({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) return null;
    if (referral.status === "converted") return referral._id;
    await ctx.db.patch(referral._id, {
      status: "converted",
      convertedAt: Date.now(),
    });
    await ctx.runMutation(internal.credits.grant, {
      userId: referral.referrerUserId,
      amountCents: referral.bonusCents,
      reason: "referral_bonus",
      referralId: referral._id,
    });
    return referral._id;
  },
});

// ─── Public reads ──────────────────────────────────────────────────
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUserOrNull(ctx);
    if (!user) return [];
    return await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerUserId", user._id))
      .order("desc")
      .take(50);
  },
});
