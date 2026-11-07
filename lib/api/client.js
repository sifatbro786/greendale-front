/**
 * Browser-side calls to /api/* (same origin; Nginx → Express in live mode, Next demo handlers in demo mode).
 * One envelope everywhere: { data } | { error: { code, message, details } }.
 * A 401 TOKEN_EXPIRED (page left open past the 15 min access token) refreshes once and retries.
 *
 * @typedef {{ ok: true, status: number, data: any, meta?: any }} ApiOk
 * @typedef {{ ok: false, status: number, error: { code: string, message: string, details?: any }, fieldErrors: Record<string, string> }} ApiFail
 */

const NETWORK = { code: "NETWORK", message: "Network problem. Please try again." };

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown }} [opts]
 * @returns {Promise<ApiOk | ApiFail>}
 */
export async function api(path, { method = "GET", body } = {}, _retried = false) {
    const write = method !== "GET" && method !== "HEAD";
    let res;
    try {
        res = await fetch(path, {
            method,
            credentials: "same-origin",
            // The API rejects state-changing requests that are not JSON (CSRF guard), even with no body.
            headers: { accept: "application/json", ...(write && { "content-type": "application/json" }) },
            body: write ? JSON.stringify(body ?? {}) : undefined,
        });
    } catch {
        return { ok: false, status: 0, error: NETWORK, fieldErrors: {} };
    }
    const json = await res.json().catch(() => null);

    if (res.status === 401 && json?.error?.code === "TOKEN_EXPIRED" && !_retried && !path.startsWith("/api/auth/")) {
        if (await refreshSession()) return api(path, { method, body }, true);
    }
    if (res.ok) return { ok: true, status: res.status, data: json?.data, meta: json?.meta };
    const error = json?.error ?? { code: `HTTP_${res.status}`, message: "Something went wrong. Please try again." };
    return { ok: false, status: res.status, error, fieldErrors: toFieldErrors(error.details) };
}

/** @type {Promise<boolean> | null} */
let refreshing = null;
/** One refresh at a time, shared by every request that hit TOKEN_EXPIRED together. */
export function refreshSession() {
    refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: "{}" })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => setTimeout(() => (refreshing = null), 0));
    return refreshing;
}

/** zod issue list [{ path: "phone", message }] → { phone: "..." } (first message per top-level field). */
export function toFieldErrors(details) {
    const out = {};
    if (!Array.isArray(details)) return out;
    for (const d of details) {
        const key = String(d?.path ?? "").split(".")[0];
        if (key && !(key in out)) out[key] = d.message;
    }
    return out;
}

/**
 * Multipart upload to POST /api/uploads (field "file"). Returns the same result shape as api().
 * Success data: { path, url, thumbPath?, thumbUrl?, width?, height?, size? }
 * @param {File} file
 * @param {{ kind: "image" | "pdf", folder: string }} opts
 * @returns {Promise<ApiOk | ApiFail>}
 */
export async function uploadFile(file, { kind, folder }, _retried = false) {
    const fd = new FormData();
    fd.append("file", file);
    let res;
    try {
        res = await fetch(`/api/uploads?kind=${kind}&folder=${encodeURIComponent(folder)}`, { method: "POST", body: fd, credentials: "same-origin", headers: { accept: "application/json" } });
    } catch {
        return { ok: false, status: 0, error: NETWORK, fieldErrors: {} };
    }
    const json = await res.json().catch(() => null);
    if (res.status === 401 && json?.error?.code === "TOKEN_EXPIRED" && !_retried && (await refreshSession())) return uploadFile(file, { kind, folder }, true);
    if (res.ok) return { ok: true, status: res.status, data: json?.data };
    const error = json?.error ?? { code: `HTTP_${res.status}`, message: res.status === 413 ? "The file is too large." : "Upload failed. Please try again." };
    return { ok: false, status: res.status, error, fieldErrors: {} };
}
