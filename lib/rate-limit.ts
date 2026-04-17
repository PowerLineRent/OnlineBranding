type LimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, LimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
};

export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = store.get(key);

  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (current.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  store.set(key, current);
  return { allowed: true, retryAfterSec: 0 };
}
