import { notFound } from "next/navigation";

import UserActions from "@/components/dash/admin/UserActions";
import UserForm from "@/components/dash/admin/UserForm";
import { Badge, Card, DefinitionList, PageHead, STATUS_TONE } from "@/components/dash/ui";
import { canAssignRole, holdsAll } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getUser, listRoles } from "@/lib/dashboard/users";
import { formatDateTime } from "@/lib/format";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "User" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function UserPage({ params }) {
    const me = await requirePermission("users.manage");
    const { id } = await params;
    const [u, roles] = await Promise.all([getUser(id), listRoles()]);
    if (!u) notFound();

    const isSelf = u.id === me.id;
    const targetRole = roles.find((r) => r.id === u.roleId);
    // Mirrors the API guard; the API is the real check.
    const canManage = targetRole ? (targetRole.role === "SUPER_ADMIN" ? me.role === "SUPER_ADMIN" : holdsAll(me, targetRole.permissions)) : false;
    const options = roles.filter((r) => r.id === u.roleId || canAssignRole(me, r)).map(({ id: rid, label, role }) => ({ id: rid, label, role }));

    return (
        <>
            <PageHead
                title={u.name}
                description={u.roleName}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users & roles", href: "/admin/users" }, { label: u.name }]}
                actions={
                    <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[u.status]}>{u.status === "ACTIVE" ? "Active" : "Disabled"}</Badge>
                        {u.locked && <Badge tone="yellow">Locked</Badge>}
                        {u.mustChangePassword && <Badge tone="blue">Must change password</Badge>}
                    </div>
                }
            />
            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                <Card title="Account">
                    {canManage ? (
                        <UserForm mode="edit" user={u} roles={options} demo={isDemo} isSelf={isSelf} />
                    ) : (
                        <p className="text-[14.5px] text-ink-soft">This account has permissions you do not have, so only a higher role can change it.</p>
                    )}
                </Card>
                <div className="space-y-4">
                    <Card title="Sign-in">
                        <DefinitionList
                            items={[
                                ["Last sign-in", u.lastLogin ? formatDateTime(u.lastLogin) : "Never"],
                                ["Password changed", u.passwordChangedAt ? formatDateTime(u.passwordChangedAt) : "—"],
                                ["Staff record", u.staff ? `${u.staff.name} · ${u.staff.designation}` : "Not linked"],
                                ["Created", formatDateTime(u.createdAt)],
                            ]}
                        />
                    </Card>
                    {canManage && (
                        <Card title="Actions">
                            <UserActions user={{ id: u.id, name: u.name, status: u.status, locked: u.locked }} isSelf={isSelf} demo={isDemo} />
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
