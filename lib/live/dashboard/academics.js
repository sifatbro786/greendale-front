import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/academics (greendale-back modules/academics + staff). */

export const listClasses = () => apiData("/api/academics/classes");
export const listSectionOptions = () => apiData("/api/academics/sections");
export const listSessions = () => apiData("/api/academics/sessions");
export const getGradeScale = () => apiData("/api/academics/grade-scale");
export const listStaff = () => apiData("/api/staff");

/** Teacher "own" scope. A missing staff link (admin accounts) → empty list, not an error. */
export async function teacherAssignments(staffId) {
    if (!staffId) return [];
    return apiData(`/api/academics/teachers/${encodeURIComponent(staffId)}/assignments`);
}
export async function teacherSections(staffId) {
    if (!staffId) return [];
    return apiData(`/api/academics/teachers/${encodeURIComponent(staffId)}/sections`);
}

async function orNull(path) {
    const r = await apiFetch(path);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || `API ${path} failed with ${r.status}`);
    return r.data;
}
export const getClassDetail = (id) => orNull(`/api/academics/classes/${encodeURIComponent(id)}`);
export const getStaffMember = (id) => orNull(`/api/staff/${encodeURIComponent(id)}`);
