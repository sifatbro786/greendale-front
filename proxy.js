import { NextResponse } from "next/server";

import { homeFor } from "@/lib/auth/permissions";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session-token";

/**
 * Route guard (Next 16 "proxy", formerly middleware). Optimistic check only: it verifies the signed
 * cookie and routes people to the right area. Real authorisation happens server-side (lib/auth/session)
 * and, from Phase 2, in the Express API.
 */
export async function proxy(request) {
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

    if (pathname.startsWith("/admin") && session.role === "STUDENT") return NextResponse.redirect(new URL("/portal", request.url));
    if (pathname.startsWith("/portal") && session.role !== "STUDENT") return NextResponse.redirect(new URL("/admin", request.url));

    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
}

export const config = {
    matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
