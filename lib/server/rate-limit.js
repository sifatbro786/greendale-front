/**
 * Fixed-window in-memory rate limiter.
 * Phase 1 only: on Vercel each serverless instance has its own memory, so this is best-effort.
 * Phase 2 moves the contact form to Express with a Redis-backed limiter (PRD §11), which is exact.
 */
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now > b.reset) {
        buckets.set(key, { count: 1, reset: now + windowMs });
        if (buckets.size > 5000) for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
        return { ok: true, remaining: limit - 1, retryAfter: 0 };
    }
    b.count += 1;
    return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), retryAfter: Math.ceil((b.reset - now) / 1000) };
}

/** Client IP behind Vercel / Nginx / Cloudflare. */
export function clientIp(headers) {
    if (process.env.BEHIND_CLOUDFLARE === "true" && headers.get("cf-connecting-ip")) return headers.get("cf-connecting-ip");
    return headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
