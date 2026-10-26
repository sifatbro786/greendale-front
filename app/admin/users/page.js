import { Check, UserPlus } from "lucide-react";

import DataTable from "@/components/dash/DataTable";
import DemoButton from "@/components/dash/DemoButton";
import { Card, PageHead } from "@/components/dash/ui";
import { PERMISSION_GROUPS, ROLE_LABEL } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listRoles, listUsers } from "@/lib/dashboard/users";

export const metadata = { title: "Users & roles" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function UsersPage() {
    await requirePermission("users.manage");
    const [users, roles] = await Promise.all([listUsers(), listRoles()]);
    return (
        <>
            <PageHead
                title="Users & roles"
                description="A role is a set of permissions. The API checks every request, so hiding a menu is never the only protection."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users & roles" }]}
                actions={
                    <DemoButton className="btn-primary min-h-10 text-[14px]">
                        <UserPlus className="size-4" aria-hidden="true" /> Add user
                    </DemoButton>
                }
            />
            <Card padded={false}>
                <DataTable
                    rows={users.map((u) => ({ ...u, roleLabel: ROLE_LABEL[u.role] }))}
                    columns={[
                        { key: "name", label: "User", type: "person", sub: "login" },
                        { key: "roleLabel", label: "Role" },
                        { key: "lastLogin", label: "Last sign-in", type: "datetime" },
                        { key: "status", label: "Status", type: "badge" },
                    ]}
                    searchKeys={["name", "login"]}
                    filters={[{ key: "role", label: "Role", options: Object.entries(ROLE_LABEL).filter(([k]) => k !== "STUDENT").map(([value, label]) => ({ value, label })) }]}
                />
            </Card>
            <Card title="Permissions by role" description="Defaults from the PRD. The school can add custom roles later." className="mt-4" padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-[13.5px]">
                        <thead>
                            <tr className="border-b border-line bg-paper/60">
                                <th className="px-5 py-3 text-[12.5px] font-semibold tracking-wide text-ink-soft uppercase">Permission</th>
                                {roles.map((r) => (
                                    <th key={r.role} className="px-3 py-3 text-center text-[12.5px] font-semibold text-ink">
                                        {r.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {PERMISSION_GROUPS.map((g) => [
                                <tr key={g.module} className="bg-paper/40">
                                    <td colSpan={roles.length + 1} className="px-5 py-2 text-[12px] font-semibold tracking-wider text-brand-deep uppercase">
                                        {g.module}
                                    </td>
                                </tr>,
                                ...g.perms.map(([p, label]) => (
                                    <tr key={p} className="border-b border-line">
                                        <td className="px-5 py-2.5">
                                            <span className="text-ink">{label}</span>
                                            <code className="ml-2 text-[11.5px] text-ink-soft">{p}</code>
                                        </td>
                                        {roles.map((r) => (
                                            <td key={r.role} className="px-3 py-2.5 text-center">
                                                {r.permissions.includes(p) ? <Check className="mx-auto size-4 text-brand" aria-label="Allowed" /> : <span className="text-ink-soft/40" aria-label="Not allowed">—</span>}
                                            </td>
                                        ))}
                                    </tr>
                                )),
                            ])}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}
