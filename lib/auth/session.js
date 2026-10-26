import "server-only";

import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { findUser } from "./demo-users";
import { can } from "./permissions";
import { SESSION_COOKIE, verifySession } from "./session-token";

/**
 * Data Access Layer for the signed-in user. Reads the cookie at request time, so callers must sit
 * inside a <Suspense> boundary (the /admin and /portal layouts provide one).
 * 'use cache: private' (Next 16): the session check (cookie + HMAC verify) is cached per browser,
 * never on the server, so navigations don't redo it and Cache Components treats it as session data.
 * @returns {Promise<{ id: string, name: string, role: string, title?: string, staffId?: string, studentId?: string, identifier: string }>}
 */
export async function getCurrentUser() {
    "use cache: private";
    cacheLife("minutes");
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const claims = await verifySession(token);
    if (!claims) redirect("/login");
    const user = findUser(claims.sub);
    if (!user) redirect("/login");
    return user;
}

/** Staff area guard: redirects students to their portal. */
export async function requireStaff() {
    const user = await getCurrentUser();
    if (user.role === "STUDENT") redirect("/portal");
    return user;
}

/** Page-level permission guard. The real enforcement moves to the API in Phase 2. */
export async function requirePermission(perm) {
    const user = await requireStaff();
    if (!can(user.role, perm)) redirect("/admin");
    return user;
}

export async function requireStudent() {
    const user = await getCurrentUser();
    if (user.role !== "STUDENT") redirect("/admin");
    return user;
}
