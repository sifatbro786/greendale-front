/** POST /api/auth/logout — clears the session cookie. Phase 2: also revokes the refresh-token family. */
import { SESSION_COOKIE } from "@/lib/auth/session-token";

export async function POST() {
    const res = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return res;
}
