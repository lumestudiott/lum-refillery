import { httpRouter } from "convex/server";
import { httpAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Convex HTTP router.
 *
 *   POST /stripe   ← Stripe webhook (configure in Stripe Dashboard at
 *                    `${NEXT_PUBLIC_CONVEX_SITE_URL}/stripe`)
 *
 * Required Convex env (`npx convex env set <NAME> <VALUE>`):
 *   - STRIPE_WEBHOOK_SECRET
 *
 * All event handlers are idempotent (by `event.id` via the
 * `webhookEvents` table) so Stripe's at-least-once delivery is safe.
 */
const http = httpRouter();

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.error(
        "STRIPE_WEBHOOK_SECRET is not set. " +
          "Run `npx convex env set STRIPE_WEBHOOK_SECRET <secret>`."
      );
      return new Response("Server misconfigured", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }
    const body = await request.text();
    const ok = await verifyStripeSignature(body, signature, secret);
    if (!ok) return new Response("Invalid signature", { status: 400 });

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Idempotency: insert (provider, eventId) and SCHEDULE background action.
    // We always return 200 OK to Stripe immediately so their system doesn't timeout!
    const fresh: boolean = await ctx.runMutation(
      internal.webhookEvents.recordAndSchedule,
      { provider: "stripe", eventId: event.id, eventType: event.type, payload: event }
    );
    
    if (!fresh) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true, async: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;



// ─── Stripe webhook signature verification (Web Crypto) ────────────
const DEFAULT_TOLERANCE_SECONDS = 300;

async function verifyStripeSignature(
  body: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS
): Promise<boolean> {
  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestamp) > toleranceSeconds) return false;
  const expected = await hmacSha256Hex(secret, `${timestamp}.${body}`);
  return signatures.some((sig) => timingSafeEqualHex(sig, expected));
}

function parseStripeSignatureHeader(header: string): {
  timestamp: number | null;
  signatures: string[];
} {
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (!key || !value) continue;
    if (key.trim() === "t") {
      const n = Number(value.trim());
      if (Number.isFinite(n)) timestamp = n;
    } else if (key.trim() === "v1") {
      signatures.push(value.trim());
    }
  }
  return { timestamp, signatures };
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sigBuf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
