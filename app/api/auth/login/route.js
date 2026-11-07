/**
 * POST /api/auth/login — DEMO login (DATA_MODE=demo). In live mode next.config rewrites /api/* to Express
 * (and Nginx does the same on the VPS), so this file never runs there. Same contract as Express:
 *   body { identifier, password, next? } → 200 { data: { user: { id, name, role }, redirectTo } } + httpOnly cookie
 *   400 BAD_REQUEST (details) · 401 INVALID_CREDENTIALS · 415 · 429 TOO_MANY_REQUESTS
 */
import { z } from "zod";

import { homeFor } from "@/lib/auth/permissions";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/auth/session-token";
import { fail, guardJsonPost, issues, ok } from "@/lib/server/envelope";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { isLive } from "@/lib/mode";

const schema = z.object({
    identifier: z.string().trim().min(3, "Enter your email or student ID.").max(120),
    password: z.string().min(1, "Enter your password.").max(200),
    next: z.string().max(200).optional(),
});

/** Only allow same-site relative paths in ?next= (no open redirects). */
function safeNext(next, role) {
    if (!next || !next.startsWith("/") || next.startsWith("//")) return homeFor(role);
    if (role === "STUDENT" && !next.startsWith("/portal")) return "/portal";
    if (role !== "STUDENT" && !next.startsWith("/admin")) return "/admin";
    return next;
}

export async function POST(request) {
    // Live mode: /api/* belongs to Express (rewrite / Nginx). Never authenticate demo accounts here.
    if (isLive) return fail(404, "NOT_FOUND", "Not found");
    const stop = guardJsonPost(request);
    if (stop) return stop;

    const rl = rateLimit(`login:${clientIp(request.headers)}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rl.ok) return fail(429, "TOO_MANY_REQUESTS", "Too many attempts. Please wait a minute and try again.", undefined, { "Retry-After": String(rl.retryAfter) });

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return fail(400, "BAD_REQUEST", "Invalid request", issues(parsed.error));

    // Loaded on demand: the live build must never evaluate lib/demo (lib/demo/seed.js throws in live mode).
    const { verifyCredentials } = await import("@/lib/auth/demo-users");
    const user = verifyCredentials(parsed.data.identifier, parsed.data.password);
    if (!user) return fail(401, "INVALID_CREDENTIALS", "Wrong email / student ID or password.");

    const token = await signSession({ sub: user.id, role: user.role, name: user.name });
    const res = ok({ user: { id: user.id, name: user.name, role: user.role }, redirectTo: safeNext(parsed.data.next, user.role) });
    res.headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
    return res;
}
