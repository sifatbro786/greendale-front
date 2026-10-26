/**
 * Signed session token (HMAC-SHA256 via Web Crypto) — works in proxy.js and in Node.
 * DEMO ONLY: Phase 2 replaces this with the API's short access token + rotating refresh token
 * (both httpOnly cookies, PRD §11). The cookie name and the {sub, role, name} claims stay the same.
 */

export const SESSION_COOKIE = "gd_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const enc = new TextEncoder();

function secret() {
    const s = process.env.SESSION_SECRET;
    if (s && s.length >= 32) return s;
    // Fallback keeps the demo working out of the box; set SESSION_SECRET (32+ chars) on Vercel.
    return "greendale-demo-session-secret-change-me-2026";
}

const b64url = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key() {
    return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/** @param {{ sub: string, role: string, name: string }} claims */
export async function signSession(claims) {
    const payload = { ...claims, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
    const body = b64url(enc.encode(JSON.stringify(payload)));
    const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(body));
    return `${body}.${b64url(sig)}`;
}

/** @returns {Promise<{ sub: string, role: string, name: string, exp: number } | null>} */
export async function verifySession(token) {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    const [body, sig] = token.split(".");
    try {
        const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
        if (!ok) return null;
        const payload = JSON.parse(new TextDecoder().decode(fromB64url(body)));
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}
