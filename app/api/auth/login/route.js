/**
 * POST /api/auth/login — DEMO login. Contract kept for Phase 2 (Express /api/auth/login):
 *   body { identifier, password } → 200 { ok, user: { id, name, role }, redirectTo } + httpOnly session cookie
 *   401 wrong credentials · 422 validation · 429 rate limited
 */
import { z } from "zod";

import { verifyCredentials } from "@/lib/auth/demo-users";
import { homeFor } from "@/lib/auth/permissions";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/auth/session-token";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

const schema = z.object({
    identifier: z.string().trim().min(3, "Enter your email or student ID.").max(120),
    password: z.string().min(1, "Enter your password.").max(200),
    next: z.string().max(200).optional(),
});

const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Only allow same-site relative paths in ?next= (no open redirects). */
function safeNext(next, role) {
    if (!next || !next.startsWith("/") || next.startsWith("//")) return homeFor(role);
    if (role === "STUDENT" && !next.startsWith("/portal")) return "/portal";
    if (role !== "STUDENT" && !next.startsWith("/admin")) return "/admin";
    return next;
}

export async function POST(request) {
    if (!request.headers.get("content-type")?.includes("application/json")) return json({ ok: false, message: "Unsupported content type." }, 415);
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) return json({ ok: false, message: "Forbidden." }, 403);

    const rl = rateLimit(`login:${clientIp(request.headers)}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rl.ok) return json({ ok: false, message: "Too many attempts. Please wait a minute and try again." }, 429, { "Retry-After": String(rl.retryAfter) });

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
        const fieldErrors = {};
        for (const i of parsed.error.issues) fieldErrors[i.path[0]] ??= i.message;
        return json({ ok: false, message: "Please check the highlighted fields.", fieldErrors }, 422);
    }

    const user = verifyCredentials(parsed.data.identifier, parsed.data.password);
    if (!user) return json({ ok: false, message: "Wrong email / student ID or password." }, 401);

    const token = await signSession({ sub: user.id, role: user.role, name: user.name });
    const res = json({ ok: true, user: { id: user.id, name: user.name, role: user.role }, redirectTo: safeNext(parsed.data.next, user.role) });
    res.headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
    return res;
}
