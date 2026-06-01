import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Email notification stub.
 *
 * No provider is wired yet. To enable, set `RESEND_API_KEY` (or your
 * provider of choice) via `npx convex env set`, then replace the
 * console.log below with a fetch to the provider's REST API.
 *
 * Lives in an `action` (not a mutation) because emails are an external
 * side-effect — actions can `fetch()` and retry without holding a DB
 * transaction open.
 */
export const sendTransactional = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    template: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const provider = process.env.RESEND_API_KEY ?? null;
    if (!provider) {
      console.log(
        `[email stub] would send to=${args.to} subject="${args.subject}" template=${args.template ?? "default"}`
      );
      return { delivered: false, reason: "no provider configured" };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider}`,
        },
        body: JSON.stringify({
          from: "Lume Refillery <hello@lumerefillery.com>",
          to: [args.to],
          subject: args.subject,
          html: `<p>${args.body}</p>`,
          // If you have predefined templates in Resend, you'd map them here
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Resend API error:", errorText);
        return { delivered: false, reason: `Resend HTTP ${res.status}` };
      }

      return { delivered: true, reason: "" };
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
      return { delivered: false, reason: "network or internal error" };
    }
  },
});
