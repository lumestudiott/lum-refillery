import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./lib/auth";

/**
 * Resolve a delivery zone for a given ZIP code by longest-prefix match.
 * Tries 5-, 3-, then 1-character prefixes against active zones.
 */
export async function resolveZoneForZip(
  ctx: QueryCtx,
  zip: string
): Promise<Doc<"deliveryZones"> | null> {
  const cleaned = zip.replace(/\D/g, "");
  if (cleaned.length < 3) return null;

  for (const prefixLen of [5, 3, 1]) {
    if (cleaned.length < prefixLen) continue;
    const prefix = cleaned.slice(0, prefixLen);
    const zone = await ctx.db
      .query("deliveryZones")
      .withIndex("by_zip_prefix", (q) => q.eq("zipPrefix", prefix))
      .unique();
    if (zone?.active) return zone;
  }
  return null;
}

/**
 * Public: check whether a ZIP is in our delivery footprint.
 * Returns the matched zone (without internal fields) or `null`.
 */
export const lookupByZip = query({
  args: { zip: v.string() },
  handler: async (ctx, args) => {
    const zone = await resolveZoneForZip(ctx, args.zip);
    if (!zone) return null;
    return {
      id: zone._id,
      name: zone.name,
      cutoffDayOfWeek: zone.cutoffDayOfWeek,
      deliveryDayOfWeek: zone.deliveryDayOfWeek,
      shippingFeeCents: zone.shippingFeeCents,
      carrier: zone.carrier,
    };
  },
});

/**
 * Public list of active zones (for marketing pages).
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("deliveryZones")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(200);
  },
});

// ─── Admin write API ───────────────────────────────────────────────
export const upsertZone = mutation({
  args: {
    zipPrefix: v.string(),
    name: v.string(),
    cutoffDayOfWeek: v.number(),
    cutoffHour: v.number(),
    deliveryDayOfWeek: v.number(),
    carrier: v.optional(v.string()),
    shippingFeeCents: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("deliveryZones")
      .withIndex("by_zip_prefix", (q) => q.eq("zipPrefix", args.zipPrefix))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("deliveryZones", args);
  },
});

/**
 * INTERNAL upsert used by seed scripts (bypasses admin gate so it can
 * run from the Convex CLI before any admin user exists).
 */
export const internalUpsertZone = internalMutation({
  args: {
    zipPrefix: v.string(),
    name: v.string(),
    cutoffDayOfWeek: v.number(),
    cutoffHour: v.number(),
    deliveryDayOfWeek: v.number(),
    carrier: v.optional(v.string()),
    shippingFeeCents: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deliveryZones")
      .withIndex("by_zip_prefix", (q) => q.eq("zipPrefix", args.zipPrefix))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("deliveryZones", args);
  },
});
