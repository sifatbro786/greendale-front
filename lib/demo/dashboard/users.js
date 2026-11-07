import "server-only";

import { PERMISSION_GROUPS, ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

import { db } from "./_shared";

/** Demo implementation. Live: lib/live/dashboard/users.js → GET /api/users, /api/roles. */
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
    ].map((u) => ({ ...u, roleName: ROLE_LABEL[u.role], locked: false }));
}

/** Detail for /admin/users/[id] (same shape as GET /api/users/:id). */
export async function getUser(id) {
    const u = (await listUsers()).find((x) => x.id === id);
    if (!u) return null;
    const staff = db.staff.find((t) => `usr-${t.id}` === id);
    return {
        ...u,
        email: u.login.includes("@") ? u.login : null,
        phone: null,
        roleId: u.role,
        mustChangePassword: false,
        passwordChangedAt: null,
        createdAt: "2026-01-05T10:00:00+06:00",
        staff: staff ? { id: staff.id, name: staff.name, designation: staff.designation ?? "Teacher" } : null,
    };
}

const ALL_STAFF = PERMISSION_GROUPS.flatMap((g) => g.perms.map(([p]) => p));

export async function listRoles() {
    const users = await listUsers();
    return Object.keys(ROLE_PERMISSIONS)
        .filter((r) => r !== "STUDENT")
        .map((r) => ({
            id: r,
            role: r,
            label: ROLE_LABEL[r],
            description: null,
            permissions: r === "SUPER_ADMIN" ? ALL_STAFF : ROLE_PERMISSIONS[r],
            isSystem: true,
            editable: r !== "SUPER_ADMIN",
            userCount: users.filter((u) => u.role === r).length,
        }));
}

export async function getRole(id) {
    return (await listRoles()).find((r) => r.id === id) ?? null;
}
