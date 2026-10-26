import "server-only";

import { ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

import { db } from "./_shared";

/** Future: GET /api/users, GET /api/roles */
export async function listUsers() {
    const staffUsers = db.staff.map((t, i) => ({
        id: `usr-${t.id}`,
        name: t.name,
        login: t.email,
        role: t.id === "t01" ? "ADMIN" : "TEACHER",
        status: "ACTIVE",
        lastLogin: `2026-10-${String(26 - (i % 5)).padStart(2, "0")}T0${7 + (i % 3)}:1${i}:00+06:00`,
    }));
    return [
        { id: "usr-super", name: "Super Admin", login: "solaimanislamsifat@gmail.com", role: "SUPER_ADMIN", status: "ACTIVE", lastLogin: "2026-10-26T09:02:00+06:00" },
        { id: "usr-admin", name: "Mahmuda Khanam", login: "admin@greendale.demo", role: "ADMIN", status: "ACTIVE", lastLogin: "2026-10-26T08:41:00+06:00" },
        { id: "usr-office", name: "Office Desk", login: "office@greendale.demo", role: "OFFICE", status: "ACTIVE", lastLogin: "2026-10-26T08:15:00+06:00" },
        { id: "usr-accounts", name: "Accounts Desk", login: "accounts@greendale.demo", role: "ACCOUNTANT", status: "ACTIVE", lastLogin: "2026-10-25T13:30:00+06:00" },
        ...staffUsers,
        { id: "usr-t09", name: "Former Teacher", login: "former@greendale.demo", role: "TEACHER", status: "DISABLED", lastLogin: "2026-06-30T12:00:00+06:00" },
    ];
}

export async function listRoles() {
    return Object.keys(ROLE_PERMISSIONS)
        .filter((r) => r !== "STUDENT")
        .map((r) => ({ role: r, label: ROLE_LABEL[r], permissions: ROLE_PERMISSIONS[r] }));
}
