import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled jobs.
 *
 * Use `crons.interval` (not the hourly/daily helpers, per project rules).
 */
const crons = cronJobs();

// Hourly: lock any draft boxes whose cutoff has passed.
crons.interval(
  "lock expired box drafts",
  { hours: 1 },
  internal.boxes.lockExpired,
  { batchSize: 100 }
);

// Every 6 hours: mark shipped boxes as delivered after their delivery date.
crons.interval(
  "mark delivered",
  { hours: 6 },
  internal.boxes.markDeliveredSweep,
  { batchSize: 100 }
);

export default crons;
