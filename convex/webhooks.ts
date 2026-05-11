/**
 * convex/webhooks.ts
 *
 * HTTP router for Convex HTTP actions.
 * WiiPay has been fully removed — all payment processing now goes through
 * Stripe via Next.js API routes (/api/webhooks/stripe).
 *
 * This file is kept for any future Convex HTTP endpoints (e.g., third-party
 * integrations that need to call Convex directly).
 */
import { httpRouter } from "convex/server";

const http = httpRouter();

// All Stripe webhook handling is done in Next.js API routes
// at /api/webhooks/stripe, which then calls Convex mutations
// via ConvexHttpClient.
//
// This keeps webhook signature verification in Node.js (where the
// Stripe SDK runs natively) and avoids exposing Convex HTTP
// endpoints publicly without auth.

export default http;