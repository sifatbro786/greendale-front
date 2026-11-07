import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/attendance (greendale-back modules/attendance). */

const q = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)).toString();

export const getAttendanceSheet = (sectionId, date) => apiData(`/api/attendance/sheet?${q({ sectionId, date })}`);
export const attendanceSummary = (date) => apiData(`/api/attendance/summary?${q({ date })}`);
export const attendanceTrend = (n = 14) => apiData(`/api/attendance/trend?days=${n}`);
export const monthlyReport = (sectionId, month) => apiData(`/api/attendance/report?${q({ sectionId, month })}`);
export const recentSchoolDays = (n = 6) => apiData(`/api/attendance/dates?n=${n}`);
export const listHolidays = () => apiData("/api/attendance/holidays");

export async function studentAttendanceMonth(studentId, month) {
    const r = await apiFetch(`/api/attendance/students/${encodeURIComponent(studentId)}?month=${month}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(r.error?.message || "Could not load attendance.");
    return r.data;
}
