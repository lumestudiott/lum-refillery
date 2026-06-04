import { internalMutation } from "./_generated/server";

export const addTags = internalMutation({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    // Just add tags randomly for demo purposes
    for (const [index, product] of products.entries()) {
      if (index % 5 === 0) {
        await ctx.db.patch(product._id, { tags: ["Sale"] });
      } else if (index % 7 === 0) {
        await ctx.db.patch(product._id, { tags: ["Best Seller"] });
      } else if (index % 3 === 0) {
        await ctx.db.patch(product._id, { tags: ["Local", "Organic"] });
      }
    }
  },
});
