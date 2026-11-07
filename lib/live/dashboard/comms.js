import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/**
 * Live implementation of lib/dashboard/comms. Ported: listAudit (2b), website CMS (2c).
 * Staff notices and SMS land in Step 3.
 */

/** Newest 500 entries; the table filters and pages them in the browser. */
export const listAudit = () => apiData("/api/audit?limit=500");

/* ---------------- Website CMS (Step 2c) ---------------- */

/** GET /api/cms/overview → { notices, news, albums, pages, messages } */
export const cmsOverview = () => apiData("/api/cms/overview");

async function orNull(path) {
    const r = await apiFetch(path);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || `API ${path} failed with ${r.status}`);
    return r.data;
}

export const getCmsPage = (id) => orNull(`/api/cms/pages/${encodeURIComponent(id)}`);
export const getCmsNews = (id) => orNull(`/api/cms/news/${encodeURIComponent(id)}`);
export const getCmsAlbum = (id) => orNull(`/api/cms/albums/${encodeURIComponent(id)}`);
