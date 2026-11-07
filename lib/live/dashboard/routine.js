import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/routine (greendale-back modules/routine). */

export async function getRoutine({ sectionId, staffId }) {
    const r = await apiFetch(`/api/routine?${sectionId ? `sectionId=${sectionId}` : `staffId=${staffId}`}`);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || "Could not load the routine.");
    return r.data;
}

export async function teacherToday(staffId, isoDate) {
    if (!staffId) return [];
    return apiData(`/api/routine/today?staffId=${staffId}${isoDate ? `&date=${isoDate}` : ""}`);
}
