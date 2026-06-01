# Lume Refillery - Scaling Strategy (10x Traffic)

This document outlines the architectural patterns and operational strategies required to handle a 10x increase in traffic and user base, ensuring Lume Refillery remains highly available, performant, and cost-efficient.

## 1. Edge Caching & Incremental Static Regeneration (ISR)

Currently, the product catalog is stored in Convex. However, querying the database directly for every unauthenticated user hitting the homepage or shop page will become a bottleneck during traffic spikes (e.g., a viral marketing campaign).

**Implementation Plan:**
- **Next.js ISR:** Use Next.js `revalidate` on catalog pages (e.g., `/shop`). Fetch the product list from Convex server-side and cache it at the Vercel Edge for 60 seconds (`revalidate: 60`).
- **Cache Invalidation:** Instead of time-based revalidation, we can use Convex Actions to hit a Next.js On-Demand Revalidation API route whenever a product price or stock status changes. This ensures 100% cache hit rates for anonymous traffic without serving stale data.
- **Client Hydration:** Authenticated-specific states (e.g., "Add to Cart", user credit balance) are hydrated on the client-side via `useQuery`, bypassing the static cache.

## 2. Asynchronous Webhooks & Dead-Letter Queues

We have already decoupled our Stripe webhook ingestion from the actual processing logic.
- **Immediate Acknowledgment:** The Next.js API route immediately returns a `200 OK` to Stripe and dumps the payload into a `webhookEvents` table.
- **Background Processing:** Convex Background Actions process the queue.
- **Scaling Benefit:** During a massive influx of checkouts or subscription renewals, Stripe will not experience timeouts. Convex will process the queue at its maximum concurrency limit without dropping events. Failed events are marked with `status: "failed"` and can be replayed automatically via a scheduled cron job.

## 3. Batching Heavy Cron Jobs

Generating weekly delivery boxes for thousands of subscribers simultaneously will exceed serverless execution time limits if done sequentially.

**Implementation Plan:**
- **Pagination / Chunking:** The weekly box generation cron job should not process all users in a single transaction. Instead, it queries active subscriptions with a `cursor`.
- **Fan-Out Pattern:** The primary cron job dispatches multiple Convex Background Mutations, each handling a chunk of 50-100 users. 
- **Idempotency:** Because box generation is idempotent (checking if `weekKey` already exists), if a batch fails and is retried, duplicate boxes will not be created.

## 4. Database Indexing & Read Optimization

- **Composite Indexes:** As the `shopOrders` and `boxes` tables grow, queries filtering by `status` and `userId` will slow down. Ensure composite indexes are used (e.g., `.index("by_user_status", ["userId", "status"])`).
- **Denormalization:** Frequently accessed relational data (like current subscription tier details) are denormalized onto the user object or the box snapshot to prevent N+1 query problems when rendering dashboards.

## 5. Media & Asset Delivery

- **Image Optimization:** All user-uploaded content and product images must be routed through Next.js `next/image` or a dedicated CDN (like Cloudinary) to ensure WebP formatting and automatic resizing based on device viewport, drastically reducing LCP (Largest Contentful Paint) times during high load.
