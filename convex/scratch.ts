import { internalMutation } from "./_generated/server";

export const clearAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Delete all addresses
    const addresses = await ctx.db.query("addresses").collect();
    for (const address of addresses) {
      await ctx.db.delete(address._id);
    }

    // Delete all active boxes (subscriptions)
    const boxes = await ctx.db.query("boxes").collect();
    for (const box of boxes) {
      await ctx.db.delete(box._id);
    }

    return { 
      usersDeleted: users.length, 
      addressesDeleted: addresses.length,
      boxesDeleted: boxes.length
    };
  },
});

export const seedBanners = internalMutation({
  args: {},
  handler: async (ctx) => {
    const time = Date.now();
    await ctx.db.insert("promotions", {
      name: "Welcome Discount",
      description: "10% off your first refill.",
      discountPercent: 10,
      promoCode: "LUMEFIRST",
      bannerText: "10% off your first refill with code LUMEFIRST",
      active: true,
      createdAt: time,
    });
    
    await ctx.db.insert("promotions", {
      name: "Free Local Delivery",
      description: "Free local delivery on orders over TT$50",
      discountPercent: 0,
      bannerText: "Free local delivery on orders over TT$50",
      active: true,
      createdAt: time,
    });

    return "Banners seeded!";
  }
});

/** One-time: patch existing "Welcome Discount" with the LUMEFIRST promo code. */
export const patchPromoCode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const promos = await ctx.db
      .query("promotions")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(20);

    let patched = 0;
    for (const p of promos) {
      if (p.name === "Welcome Discount" && !p.promoCode) {
        await ctx.db.patch(p._id, { promoCode: "LUMEFIRST" });
        patched++;
      }
    }
    return { patched };
  },
});
