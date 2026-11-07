/**
 * Demo-mode route handlers answer in the same envelope as the Express API, so client code
 * (lib/api/client.js) has one contract: { data } | { error: { code, message, details? } }.
 */
const NO_STORE = { "Cache-Control": "no-store" };

export const ok = (data, init = {}) => Response.json({ data }, { status: 200, ...init, headers: { ...NO_STORE, ...init.headers } });

/** @param {number} status @param {string} code @param {string} message @param {unknown} [details] */
export const fail = (status, code, message, details, headers = {}) =>
    Response.json({ error: { code, message, ...(details !== undefined && { details }) } }, { status, headers: { ...NO_STORE, ...headers } });

/** zod error → [{ path, message }] (same shape as the API's validate middleware) */
export const issues = (zodError) => zodError.issues.map((i) => ({ path: i.path.join("."), message: i.message }));

/** JSON-only + same-origin guard shared by the demo POST handlers. Returns a Response to stop, or null. */
export function guardJsonPost(request) {
    if (!request.headers.get("content-type")?.includes("application/json")) return fail(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) return fail(403, "FORBIDDEN", "Forbidden.");
    return null;
}
