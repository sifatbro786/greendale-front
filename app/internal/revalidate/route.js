/**
 * POST /internal/revalidate { tags: string[] }  header x-revalidate-secret
 * Called by the API worker (greendale-back jobs/system.job.js "web.revalidate") after CMS saves.
 * Server to server only: the worker calls WEB_INTERNAL_URL (127.0.0.1:3000) directly, and Nginx must
 * deny /internal/ from the internet (deploy notes). The shared secret is checked in constant time.
 */
import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

const TAG = /^[a-z]+(:[a-z0-9:-]{1,200})?$/;

function secretOk(given) {
    const expected = process.env.REVALIDATE_SECRET;
    if (!expected || expected.length < 16 || typeof given !== "string") return false;
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
    if (!secretOk(request.headers.get("x-revalidate-secret"))) {
        return Response.json({ error: { code: "UNAUTHORIZED", message: "Bad secret" } }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const tags = Array.isArray(body?.tags) ? body.tags.filter((t) => typeof t === "string" && TAG.test(t)).slice(0, 50) : [];
    if (!tags.length) return Response.json({ error: { code: "BAD_REQUEST", message: "No valid tags" } }, { status: 400 });
    // expire 0: the next visitor gets the fresh page (one blocking render). With "max" the first visitor
    // after a save would still see the old page, which reads as "my change did not work" to office staff.
    for (const t of tags) revalidateTag(t, { expire: 0 });
    return Response.json({ data: { revalidated: tags } }, { headers: { "Cache-Control": "no-store" } });
}
