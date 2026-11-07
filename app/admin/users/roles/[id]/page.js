import { notFound } from "next/navigation";

import RoleForm from "@/components/dash/admin/RoleForm";
import { Card, PageHead } from "@/components/dash/ui";
import { can, PERMISSION_GROUPS } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getRole } from "@/lib/dashboard/users";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Edit role" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function RolePage({ params }) {
    const user = await requirePermission("users.manage");
    const { id } = await params;
    const role = await getRole(id);
    if (!role) notFound();
    const mine = PERMISSION_GROUPS.flatMap((g) => g.perms.map(([p]) => p)).filter((p) => can(user, p));
    const ownRole = role.role === user.role && user.role !== "SUPER_ADMIN";
    return (
        <>
            <PageHead
                title={role.label}
                description={`${role.userCount} user${role.userCount === 1 ? "" : "s"} · ${role.isSystem ? "built-in role" : "custom role"}`}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users & roles", href: "/admin/users" }, { label: role.label }]}
            />
            <Card>
                {role.editable ? (
                    <RoleForm mode="edit" role={role} mine={mine} ownRole={ownRole} demo={isDemo} />
                ) : (
                    <p className="text-[14.5px] text-ink-soft">The Super Admin role always has every permission and cannot be edited.</p>
                )}
            </Card>
        </>
    );
}
