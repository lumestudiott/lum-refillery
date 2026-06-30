/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as admin from "../admin.js";
import type * as boxes from "../boxes.js";
import type * as credits from "../credits.js";
import type * as crons from "../crons.js";
import type * as deliveryZones from "../deliveryZones.js";
import type * as email from "../email.js";
import type * as giftSubscriptions from "../giftSubscriptions.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_regions from "../lib/regions.js";
import type * as lib_time from "../lib/time.js";
import type * as newsletter from "../newsletter.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as referrals from "../referrals.js";
import type * as scratch from "../scratch.js";
import type * as scripts from "../scripts.js";
import type * as seed from "../seed.js";
import type * as shipping from "../shipping.js";
import type * as shopOrders from "../shopOrders.js";
import type * as stripeWebhooks from "../stripeWebhooks.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as webhookEvents from "../webhookEvents.js";
import type * as webhookRetry from "../webhookRetry.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  admin: typeof admin;
  boxes: typeof boxes;
  credits: typeof credits;
  crons: typeof crons;
  deliveryZones: typeof deliveryZones;
  email: typeof email;
  giftSubscriptions: typeof giftSubscriptions;
  http: typeof http;
  inventory: typeof inventory;
  "lib/auth": typeof lib_auth;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/regions": typeof lib_regions;
  "lib/time": typeof lib_time;
  newsletter: typeof newsletter;
  payments: typeof payments;
  products: typeof products;
  referrals: typeof referrals;
  scratch: typeof scratch;
  scripts: typeof scripts;
  seed: typeof seed;
  shipping: typeof shipping;
  shopOrders: typeof shopOrders;
  stripeWebhooks: typeof stripeWebhooks;
  subscriptions: typeof subscriptions;
  users: typeof users;
  webhookEvents: typeof webhookEvents;
  webhookRetry: typeof webhookRetry;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
