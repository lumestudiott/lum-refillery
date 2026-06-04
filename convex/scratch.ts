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
