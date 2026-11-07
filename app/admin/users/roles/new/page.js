import RoleForm from "@/components/dash/admin/RoleForm";
import { Card, PageHead } from "@/components/dash/ui";
import { can, PERMISSION_GROUPS } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "New role" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function NewRolePage() {
    const user = await requirePermission("users.manage");
    const mine = PERMISSION_GROUPS.flatMap((g) => g.perms.map(([p]) => p)).filter((p) => can(user, p));
    return (
        <>
            <PageHead
                title="New role"
                description="A role is a set of permissions. Give each role only what the job needs."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users & roles", href: "/admin/users" }, { label: "New role" }]}
            />
            <Card>
                <RoleForm mode="create" mine={mine} demo={isDemo} />
            </Card>
        </>
    );
}
