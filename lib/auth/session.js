import "server-only";

import { cacheLife } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { apiFetch } from "@/lib/api/server";
import { isLive } from "@/lib/mode";

import { can } from "./permissions";
import { SESSION_COOKIE, verifySession } from "./session-token";

/**
 * Data Access Layer for the signed-in user. Reads cookies at request time, so callers must sit
 * inside a <Suspense> boundary (the /admin and /portal layouts provide one).
 *
 * @typedef {Object} CurrentUser
 * @property {string} id
 * @property {string} name
 * @property {string} role               role key (SUPER_ADMIN, ADMIN, OFFICE, ACCOUNTANT, TEACHER, STUDENT or custom)
 * @property {string} [roleName]         live mode: Role.name from the DB
 * @property {string[]} [permissions]    live mode: the role's permissions (demo mode derives them from role)
 * @property {string | null} [title]
 * @property {string | null} [staffId]
 * @property {string | null} [studentId]
 * @property {string} identifier
 * @property {boolean} [mustChangePassword]
 *
 * @returns {Promise<CurrentUser>}
 */
export async function getCurrentUser() {
    return isLive ? liveCurrentUser() : demoCurrentUser();
}

/**
 * Demo: signed cookie + static demo users. 'use cache: private' caches the check per browser
 * (never on the server), so navigations don't redo it.
 */
async function demoCurrentUser() {
    "use cache: private";
    cacheLife("minutes");
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const claims = await verifySession(token);
    if (!claims) redirect("/login");
    // Dynamic: demo-users pulls in the demo data generator, which a live server must never load.
    const { findUser } = await import("./demo-users");
    const user = findUser(claims.sub);
    if (!user) redirect("/login");
    return user;
}

/**
 * Live: GET /api/auth/me with the user's access cookie, once per request (React cache).
 * Not cached across requests: disabling a user or changing a role shows on the next page load.
 * proxy.js has already refreshed an expired access token, so a 401 here means the session is really
 * gone (user disabled, token forged or revoked). /login?expired=1 makes the proxy clear the cookies,
 * otherwise /login would bounce a still-unexpired token straight back here.
 */
const liveCurrentUser = cache(async () => {
    const r = await apiFetch("/api/auth/me");
    if (r.status === 401 || r.status === 404) {
        const back = (await headers()).get("x-gd-path");
        redirect(`/login?expired=1${back ? `&next=${encodeURIComponent(back)}` : ""}`);
    }
    if (!r.ok) throw new Error(r.error?.message || "Could not load your account. Please try again.");
    return /** @type {CurrentUser} */ (r.data);
});

/** Staff area guard: redirects students to their portal. */
export async function requireStaff() {
    const user = await getCurrentUser();
    if (user.role === "STUDENT") redirect("/portal");
    await mustChangePasswordRedirect(user, "/admin/account");
    return user;
}

/** Page-level permission guard (UX only; the API enforces every permission itself). */
export async function requirePermission(perm) {
    const user = await requireStaff();
    if (!can(user, perm)) redirect("/admin");
    return user;
}

export async function requireStudent() {
    const user = await getCurrentUser();
    if (user.role !== "STUDENT") redirect("/admin");
    await mustChangePasswordRedirect(user, "/portal/account");
    return user;
}

/**
 * Live accounts created or reset by an admin carry a one-time password: send them to the
 * change-password page before anything else. Runs in every page guard (layouts do not re-render on
 * client navigation). The API enforces the same rule with 403 PASSWORD_CHANGE_REQUIRED.
 * @param {CurrentUser} user
 * @param {string} accountPath  "/admin/account" or "/portal/account"
 */
export async function mustChangePasswordRedirect(user, accountPath) {
    if (!user.mustChangePassword) return;
    const path = (await headers()).get("x-gd-path") ?? "";
    if (!path.startsWith(accountPath)) redirect(accountPath);
}
