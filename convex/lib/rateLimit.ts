import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Allow 10 checkouts per minute, burst up to 20
  checkout: {
    kind: "token bucket",
    rate: 10,
    period: MINUTE,
    capacity: 20,
  },
  // Newsletter signup: max 5 per hour per IP/user
  newsletter: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },
  // Gift creation: max 10 per hour
  giftCreation: {
    kind: "token bucket",
    rate: 10,
    period: HOUR,
    capacity: 10,
  },
  // Referrals: max 20 per hour
  referral: {
    kind: "token bucket",
    rate: 20,
    period: HOUR,
    capacity: 30,
  }
});

import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const checkCheckoutLimit = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, "checkout", { key: args.clerkId });
    return status.ok;
  }
});
