import "server-only";
import { redis } from "./redis";

const TOTAL_KEY = "gittinder:scouts:total";

// Increment the all-time scout counter. Best-effort: never throws and never
// blocks the page if Redis is slow or down.
export async function recordScout(): Promise<void> {
  if (!redis) return;
  try {
    await redis.incr(TOTAL_KEY);
  } catch (e) {
    console.error("[analytics] recordScout failed:", (e as Error).message);
  }
}

// Current scout count for the home counter. Null when unavailable (Redis off, or
// nothing recorded yet) so the UI hides the tally rather than showing a fake 0.
export async function getScoutCount(): Promise<number | null> {
  if (!redis) return null;
  try {
    const v = await redis.get(TOTAL_KEY);
    return v != null ? Number(v) : null;
  } catch {
    return null;
  }
}
