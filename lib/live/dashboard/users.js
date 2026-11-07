import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/users (greendale-back src/modules/users + roles). */

export const listUsers = () => apiData("/api/users");
export const listRoles = () => apiData("/api/roles");

/** null when the id does not exist (page shows notFound()). */
async function getOrNull(path) {
    const r = await apiFetch(path);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || `API ${path} failed with ${r.status}`);
    return r.data;
}

export const getUser = (id) => getOrNull(`/api/users/${encodeURIComponent(id)}`);
export const getRole = (id) => getOrNull(`/api/roles/${encodeURIComponent(id)}`);

export const listStaffOptions = () => apiData("/api/users/staff-options");
