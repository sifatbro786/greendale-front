import { NextResponse } from "next/server";

import { homeFor } from "@/lib/auth/permissions";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session-token";
import { API_COOKIE, API_INTERNAL_URL, isLive } from "@/lib/mode";

/**
 * Route guard (Next 16 "proxy", formerly middleware). Optimistic check only: it routes people to the
 * right area. Real authorisation happens in the Express API (live) or lib/auth/session (demo).
 *
 * Live mode also refreshes the session: when the 15 min access token is missing or about to expire
 * and a refresh cookie exists, it calls POST /api/auth/refresh server side, sends the new cookies to
 * the browser AND injects the new access token into this request, so the page renders signed in.
 * (Server Components cannot set cookies, so this is the only place a page load can refresh.)
 */
export async function proxy(request) {
    return isLive ? liveProxy(request) : demoProxy(request);
}

export const config = {
    matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};

const areaHeaders = (res) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
};

/** Students stay in /portal, staff stay in /admin. */
function wrongArea(pathname, role, url) {
    if (pathname.startsWith("/admin") && role === "STUDENT") return NextResponse.redirect(new URL("/portal", url));
    if (pathname.startsWith("/portal") && role !== "STUDENT") return NextResponse.redirect(new URL("/admin", url));
    return null;
}

/* ------------------------------- demo ------------------------------- */

async function demoProxy(request) {
    const { pathname, search } = request.nextUrl;
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

    if (pathname === "/login") {
        return session ? NextResponse.redirect(new URL(homeFor(session.role), request.url)) : NextResponse.next();
    }

    if (!session) {
        const url = new URL("/login", request.url);
        url.searchParams.set("next", pathname + search);
        const res = NextResponse.redirect(url);
        if (request.cookies.get(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
        return res;
    }

    return wrongArea(pathname, session.role, request.url) ?? areaHeaders(NextResponse.next());
}

/* ------------------------------- live ------------------------------- */

const SKEW_SECONDS = 30;

/** Reads JWT claims WITHOUT verifying (routing hint only; the API verifies every request). */
function peekJwt(token) {
    if (!token) return null;
    try {
        const part = token.split(".")[1];
        return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
        return null;
    }
}
const fresh = (claims) => typeof claims?.exp === "number" && claims.exp - SKEW_SECONDS > Date.now() / 1000;

/** "gd_at=abc; Path=/; HttpOnly" → ["gd_at", "abc"] */
function cookiePair(setCookie) {
    const first = setCookie.split(";", 1)[0];
    const i = first.indexOf("=");
    return [first.slice(0, i).trim(), first.slice(i + 1).trim()];
}

/** @returns {Promise<{ setCookies: string[], accessToken: string | null }>} */
async function refreshViaApi(request, refreshToken) {
    const fwd = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    try {
        const res = await fetch(`${API_INTERNAL_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
                cookie: `${API_COOKIE.REFRESH}=${refreshToken}`,
                "user-agent": request.headers.get("user-agent") ?? "",
                ...(fwd && { "x-forwarded-for": fwd }),
            },
            body: "{}",
            cache: "no-store",
            signal: AbortSignal.timeout(5_000),
        });
        const setCookies = res.headers.getSetCookie();
        const at = setCookies.map(cookiePair).find(([n]) => n === API_COOKIE.ACCESS)?.[1];
        return { setCookies, accessToken: res.ok && at ? at : null };
    } catch {
        // API down: do not log the user out, the page will show its own error.
        return { setCookies: [], accessToken: null };
    }
}

async function liveProxy(request) {
    const { pathname, search } = request.nextUrl;
    const url = request.url;

    // /login?expired=1 comes from getCurrentUser after a 401: drop both cookies and show the form.
    if (pathname === "/login" && request.nextUrl.searchParams.has("expired")) {
        const res = NextResponse.next();
        res.cookies.delete(API_COOKIE.ACCESS);
        res.cookies.delete(API_COOKIE.REFRESH);
        return res;
    }

    let accessToken = request.cookies.get(API_COOKIE.ACCESS)?.value;
    let claims = peekJwt(accessToken);
    /** @type {string[]} */
    let setCookies = [];

    const refreshToken = request.cookies.get(API_COOKIE.REFRESH)?.value;
    if (!fresh(claims) && refreshToken) {
        const r = await refreshViaApi(request, refreshToken);
        setCookies = r.setCookies;
        if (r.accessToken) {
            accessToken = r.accessToken;
            claims = peekJwt(accessToken);
        } else {
            claims = null;
        }
    }

    const finish = (res) => {
        for (const c of setCookies) res.headers.append("set-cookie", c);
        return res;
    };
    const signedIn = fresh(claims);

    if (pathname === "/login") {
        return finish(signedIn ? NextResponse.redirect(new URL(homeFor(claims.role), url)) : NextResponse.next());
    }

    if (!signedIn) {
        const to = new URL("/login", url);
        to.searchParams.set("next", pathname + search);
        return finish(NextResponse.redirect(to));
    }

    const redirect = wrongArea(pathname, claims.role, url);
    if (redirect) return finish(redirect);

    // Pass the (possibly new) access token and the path on to the page render.
    const headers = new Headers(request.headers);
    const jar = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
    for (const [n, v] of setCookies.map(cookiePair)) jar.set(n, v);
    jar.set(API_COOKIE.ACCESS, accessToken);
    headers.set("cookie", [...jar].map(([n, v]) => `${n}=${v}`).join("; "));
    headers.set("x-gd-path", pathname + search);
    return finish(areaHeaders(NextResponse.next({ request: { headers } })));
}
