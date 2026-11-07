import "server-only";

import { cookies } from "next/headers";

import { API_COOKIE, API_INTERNAL_URL } from "@/lib/mode";

/**
 * Server-side call to the Express API (live mode). Forwards the caller's access cookie, so the API
 * applies the user's own permissions and "own" scopes. Token refresh is NOT done here: Server
 * Components cannot set cookies, so proxy.js refreshes before the page renders.
 * Network failure throws (the nearest error boundary shows it); there is never a fallback to demo data.
 *
 * @param {string} path  "/api/..."
 * @param {{ method?: string, body?: unknown, auth?: boolean, noStore?: boolean }} [opts]
 *   auth: false for public endpoints (no cookies() call, so it works inside 'use cache')
 *   noStore: false inside 'use cache' functions (Next caches the function result; no per-fetch no-store)
 * @returns {Promise<{ ok: boolean, status: number, data?: any, meta?: any, error?: { code: string, message: string, details?: unknown } }>}
 */
export async function apiFetch(path, { method = "GET", body, auth = true, noStore = true } = {}) {
    const headers = { accept: "application/json" };
    if (auth) {
        const at = (await cookies()).get(API_COOKIE.ACCESS)?.value;
        if (at) headers.cookie = `${API_COOKIE.ACCESS}=${at}`;
    }
    if (body !== undefined) headers["content-type"] = "application/json";
    const res = await fetch(`${API_INTERNAL_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        ...(noStore && { cache: "no-store" }),
        signal: AbortSignal.timeout(15_000),
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data: json?.data, meta: json?.meta, error: json?.error };
}

/** Like apiFetch but returns data or throws (for loaders where any failure is a page error). */
export async function apiData(path, opts) {
    const r = await apiFetch(path, opts);
    if (!r.ok) {
        const err = new Error(r.error?.message || `API ${path} failed with ${r.status}`);
        err.status = r.status;
        err.code = r.error?.code;
        throw err;
    }
    return r.data;
}
