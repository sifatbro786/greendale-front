/** POST /api/auth/logout — DEMO: clears the session cookie. Live mode: Express revokes the refresh-token family. */
import { ok } from "@/lib/server/envelope";
import { SESSION_COOKIE } from "@/lib/auth/session-token";

export async function POST() {
    const res = ok({ loggedOut: true });
    res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return res;
}
