import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/students (greendale-back modules/students; teacher scope in the API). */

export async function listStudents({ sectionIds, status } = {}) {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    const rows = await apiData(`/api/students${q.size ? `?${q}` : ""}`);
    return sectionIds ? rows.filter((r) => sectionIds.includes(r.sectionId)) : rows;
}

/** null when missing or outside the caller's scope (API answers 404 for both). */
export async function getStudent(id) {
    if (!id) return null;
    const r = await apiFetch(`/api/students/${encodeURIComponent(id)}`);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || "Could not load the student.");
    return r.data;
}

export const studentCounts = () => apiData("/api/students/counts");
