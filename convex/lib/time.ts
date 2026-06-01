/**
 * Time + week-key helpers shared across mutations.
 *
 * `weekKey` is an ISO-8601 week string like `2026-W19`. Both `boxes` and
 * `weeklyInventory` are bucketed by this key so that one delivery cycle
 * = one weekKey. Aligning to ISO week (Mon-start) keeps Sun-cutoff and
 * Wed-delivery in the same key.
 */

const MS_PER_DAY = 86_400_000;

export function startOfUtcDay(epochMs: number): number {
  return Math.floor(epochMs / MS_PER_DAY) * MS_PER_DAY;
}

/**
 * Returns the ISO 8601 week key for the given timestamp, in UTC.
 * E.g. `2026-W19`.
 */
export function isoWeekKey(epochMs: number): string {
  const date = new Date(epochMs);
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7).
  const day = (date.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  const thursday = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - day + 3
    )
  );
  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
  const week1Monday =
    firstThursday.getTime() - firstThursdayDay * MS_PER_DAY;
  const weekNumber = Math.round((thursday.getTime() - week1Monday) / MS_PER_DAY / 7) + 1;
  return `${thursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Returns the next occurrence (epoch ms, UTC midnight) of `dayOfWeek`
 * (0=Sun … 6=Sat) on or after `from`.
 */
export function nextDayOfWeekUtc(from: number, dayOfWeek: number): number {
  const base = startOfUtcDay(from);
  const baseDay = new Date(base).getUTCDay();
  const delta = (dayOfWeek - baseDay + 7) % 7;
  return base + delta * MS_PER_DAY;
}

/**
 * Compute the cutoff and delivery timestamps for a given period, given
 * the zone's cutoff/delivery day-of-week (0=Sun … 6=Sat) and the
 * subscription's `currentPeriodStart`.
 *
 * Cutoff = next occurrence of `cutoffDayOfWeek` at `cutoffHour` UTC
 * Delivery = next occurrence of `deliveryDayOfWeek` strictly after cutoff
 */
export function computePeriodWindow(
  periodStartMs: number,
  cutoffDayOfWeek: number,
  cutoffHour: number,
  deliveryDayOfWeek: number
): { cutoffAt: number; deliveryDate: number; weekKey: string } {
  const cutoffDay = nextDayOfWeekUtc(periodStartMs, cutoffDayOfWeek);
  const cutoffAt = cutoffDay + cutoffHour * 3_600_000;
  const deliveryDate = nextDayOfWeekUtc(cutoffAt + MS_PER_DAY, deliveryDayOfWeek);
  return {
    cutoffAt,
    deliveryDate,
    weekKey: isoWeekKey(deliveryDate),
  };
}
