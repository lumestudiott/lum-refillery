import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Dev-only seed routine. Runs the catalog + delivery-zone upserts as
 * internal mutations (bypassing the admin gate, which would block the
 * first invocation when no admin user exists yet).
 *
 *   npx convex run seed:seedDev
 */
export const seedDev = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── Delivery zones (NYC + LA + Bay Area dev coverage) ────────
    const zones = [
      {
        zipPrefix: "100",
        name: "NYC Manhattan",
        cutoffDayOfWeek: 0, // Sun
        cutoffHour: 23,
        deliveryDayOfWeek: 3, // Wed
        carrier: "UPS",
        shippingFeeCents: 0,
        active: true,
      },
      {
        zipPrefix: "112",
        name: "NYC Brooklyn",
        cutoffDayOfWeek: 0,
        cutoffHour: 23,
        deliveryDayOfWeek: 3,
        carrier: "UPS",
        shippingFeeCents: 0,
        active: true,
      },
      {
        zipPrefix: "900",
        name: "Los Angeles",
        cutoffDayOfWeek: 1, // Mon
        cutoffHour: 23,
        deliveryDayOfWeek: 4, // Thu
        carrier: "FedEx",
        shippingFeeCents: 0,
        active: true,
      },
      {
        zipPrefix: "941",
        name: "San Francisco",
        cutoffDayOfWeek: 1,
        cutoffHour: 23,
        deliveryDayOfWeek: 4,
        carrier: "FedEx",
        shippingFeeCents: 0,
        active: true,
      },
    ];
    for (const z of zones) {
      await ctx.runMutation(internal.deliveryZones.internalUpsertZone, z);
    }

    // ── Products: a starter catalog matching the existing tiers ──
    const products = [
      // Grains
      sku("rice-jasmine-5", "Jasmine Rice (5lb)", "produce-pantry", "lb", 1199, [
        "supported",
        "essential",
        "household",
      ]),
      sku("flour-organic-5", "Organic All-Purpose Flour (5lb)", "produce-pantry", "lb", 999, [
        "essential",
        "household",
        "premium",
      ]),
      sku("pasta-bronze-1", "Bronze-Cut Penne (1lb)", "produce-pantry", "lb", 599, [
        "essential",
        "household",
        "premium",
        "gourmet",
      ]),
      sku("quinoa-organic-2", "Organic Quinoa (2lb)", "produce-pantry", "lb", 1499, [
        "premium",
        "gourmet",
      ]),
      sku("oats-rolled-3", "Rolled Oats (3lb)", "produce-pantry", "lb", 699, [
        "essential",
        "household",
      ]),
      // Pantry
      sku("oil-evoo-1L", "Cold-Pressed Olive Oil (1L)", "pantry", "L", 1899, [
        "household",
        "premium",
        "gourmet",
      ]),
      sku("vinegar-balsamic-500", "Aged Balsamic Vinegar (500ml)", "pantry", "ml", 1599, [
        "premium",
        "gourmet",
      ]),
      sku("honey-raw-12", "Raw Wildflower Honey (12oz)", "pantry", "oz", 1299, [
        "household",
        "premium",
      ]),
      sku("salt-flake-8", "Maldon Sea Salt Flakes (8oz)", "pantry", "oz", 899, [
        "premium",
        "gourmet",
      ]),
      // Beverages
      sku("coffee-singleorigin-12", "Single-Origin Coffee (12oz)", "beverage", "oz", 1599, [
        "household",
        "premium",
        "gourmet",
      ]),
      sku("tea-black-50", "Loose-Leaf Black Tea (50g)", "beverage", "g", 999, [
        "household",
        "premium",
      ]),
      // Protein
      sku("beans-black-2", "Heirloom Black Beans (2lb)", "protein", "lb", 899, [
        "supported",
        "essential",
        "household",
      ]),
      sku("lentils-french-1", "French Green Lentils (1lb)", "protein", "lb", 699, [
        "essential",
        "household",
        "premium",
      ]),
      // Canned / pantry depth
      sku("tomato-san-marzano-28", "San Marzano Tomatoes (28oz)", "pantry", "oz", 899, [
        "household",
        "premium",
        "gourmet",
      ]),
      sku("chocolate-70-100", "Single-Origin 70% Chocolate (100g)", "pantry", "g", 799, [
        "premium",
        "gourmet",
      ]),
      // ── Chilled / Refrigerated catalog (one-off shop) ──
      chilledSku(
        "milk-whole-1L",
        "Whole Milk (1L)",
        "dairy",
        "L",
        549,
        "Fresh, locally-sourced whole milk from grass-fed cows.",
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "yogurt-greek-500",
        "Greek Yogurt (500g)",
        "dairy",
        "g",
        699,
        "Thick, creamy Greek yogurt — high protein, no additives.",
        "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "cheese-cheddar-200",
        "Aged Cheddar (200g)",
        "dairy",
        "g",
        1199,
        "Sharp, 12-month aged cheddar from a Trinidad dairy co-op.",
        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "butter-salted-227",
        "European Salted Butter (227g)",
        "dairy",
        "g",
        899,
        "Cultured European-style butter with sea salt.",
        "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "eggs-pasture-12",
        "Pasture-Raised Eggs (12ct)",
        "produce",
        "pcs",
        899,
        "Free-roaming hens, golden yolks, omega-3 rich.",
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "salmon-atlantic-340",
        "Atlantic Salmon Fillet (340g)",
        "protein",
        "g",
        2299,
        "Wild-caught Atlantic salmon, vacuum-sealed for freshness.",
        "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "chicken-breast-500",
        "Free-Range Chicken Breast (500g)",
        "protein",
        "g",
        1499,
        "Hormone-free, free-range chicken breast — locally raised.",
        "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "ground-beef-454",
        "Grass-Fed Ground Beef (454g)",
        "protein",
        "g",
        1799,
        "100% grass-fed and finished, leaner with deeper flavor.",
        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "kale-bunch",
        "Organic Kale (1 bunch)",
        "produce",
        "ea",
        399,
        "Locally grown lacinato kale — washed and ready.",
        "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "spinach-baby-200",
        "Baby Spinach (200g)",
        "produce",
        "g",
        499,
        "Tender baby spinach, triple-washed.",
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "berries-mix-340",
        "Mixed Berries (340g)",
        "produce",
        "g",
        899,
        "Strawberries, blueberries, and blackberries — fresh-picked.",
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85"
      ),
      chilledSku(
        "juice-orange-1L",
        "Cold-Pressed Orange Juice (1L)",
        "beverage",
        "L",
        799,
        "Single-origin Trinidad oranges, never from concentrate.",
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=85"
      ),
    ];
    for (const p of products) {
      await ctx.runMutation(internal.products.internalUpsertProduct, p);
    }

    return {
      zonesUpserted: zones.length,
      productsUpserted: products.length,
    };
  },
});

function chilledSku(
  sku: string,
  name: string,
  category: string,
  unit: string,
  basePriceCents: number,
  description: string,
  imageUrl: string
) {
  return {
    sku,
    name,
    description,
    category,
    unit,
    basePriceCents,
    imageUrl,
    attributes: undefined,
    sourcingPartner: undefined,
    sourcingOrigin: "Trinidad & Tobago",
    weightGrams: undefined,
    defaultForTiers: [],
    active: true,
  };
}

function sku(
  sku: string,
  name: string,
  category: string,
  unit: string,
  basePriceCents: number,
  defaultForTiers: string[]
) {
  return {
    sku,
    name,
    description: undefined,
    category,
    unit,
    basePriceCents,
    imageUrl: undefined,
    attributes: undefined,
    sourcingPartner: undefined,
    sourcingOrigin: undefined,
    weightGrams: undefined,
    defaultForTiers,
    active: true,
  };
}

/**
 * Allocate a flat baseline of inventory for the given weekKey across
 * every active product. Useful for dev: lets the box generator actually
 * find stock when seeding draft boxes.
 *
 *   npx convex run seed:allocateWeek --arg weekKey 2026-W19 --arg per 50
 */
export const allocateWeek = internalMutation({
  args: { weekKey: v.string(), per: v.number() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(500);
    let n = 0;
    for (const p of products) {
      await ctx.runMutation(internal.inventory.internalSetAllocation, {
        productId: p._id,
        weekKey: args.weekKey,
        quantityAvailable: args.per,
      });
      n++;
    }
    return n;
  },
});
