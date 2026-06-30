import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/**
 * Payment provider toggle.
 *
 * The active gateway is stored in `appSettings` under key "paymentProvider".
 * Defaults to "stripe". An admin flips it to "wipay" once a WiPay account is
 * registered and credentials are configured (see `src/lib/wipay.ts`).
 */

const PROVIDER_KEY = "paymentProvider";
const PROVIDERS = ["stripe", "wipay"] as const;
type Provider = (typeof PROVIDERS)[number];

/** Public — which gateway the storefront should use right now. */
export const getActiveProvider = query({
  args: {},
  handler: async (ctx): Promise<Provider> => {
    const row = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", PROVIDER_KEY))
      .unique();
    const value = row?.value;
    return value === "wipay" ? "wipay" : "stripe";
  },
});

/** Admin — flip the active gateway. */
export const setActiveProvider = mutation({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!PROVIDERS.includes(args.provider as Provider)) {
      throw new Error(
        `Invalid provider: ${args.provider}. Must be one of: ${PROVIDERS.join(", ")}`
      );
    }
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", PROVIDER_KEY))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.provider,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("appSettings", {
        key: PROVIDER_KEY,
        value: args.provider,
        updatedAt: Date.now(),
      });
    }
    return args.provider;
  },
});
