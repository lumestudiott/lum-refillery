import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public: file a complaint or general query from the site. */
export const submit = mutation({
  args: {
    type: v.string(), // "complaint" | "query"
    name: v.string(),
    email: v.string(),
    orderRef: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const type = args.type === "complaint" ? "complaint" : "query";
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const subject = args.subject.trim();
    const message = args.message.trim();

    if (!name) throw new Error("Please tell us your name.");
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address.");
    if (!subject) throw new Error("Please add a subject.");
    if (!message) throw new Error("Please write a message.");
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new Error("Message is too long - please keep it under 4000 characters.");
    }

    // Light flood guard: cap tickets per email per day.
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = await ctx.db
      .query("supportTickets")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    const fromSameEmail = recent.filter(
      (t) => t.email === email && t.createdAt > dayAgo
    );
    if (fromSameEmail.length >= 5) {
      throw new Error(
        "You've reached the daily limit for messages. We'll get back to you soon."
      );
    }

    return await ctx.db.insert("supportTickets", {
      type,
      name,
      email,
      orderRef: args.orderRef?.trim() || undefined,
      subject,
      message,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

/** Admin: list all tickets, newest first. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const tickets = await ctx.db.query("supportTickets").collect();
    return tickets.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Admin: mark a ticket open/resolved. */
export const setStatus = mutation({
  args: { id: v.id("supportTickets"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      status: args.status === "resolved" ? "resolved" : "open",
    });
  },
});

/** Admin: delete a ticket. */
export const remove = mutation({
  args: { id: v.id("supportTickets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
