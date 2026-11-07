import UserForm from "@/components/dash/admin/UserForm";
import { Card, PageHead } from "@/components/dash/ui";
import { canAssignRole } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listRoles, listStaffOptions } from "@/lib/dashboard/users";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Add user" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function NewUserPage() {
    const user = await requirePermission("users.manage");
    const [allRoles, staffOptions] = await Promise.all([listRoles(), listStaffOptions()]);
    const roles = allRoles.filter((r) => canAssignRole(user, r));
    return (
        <>
            <PageHead
                title="Add user"
                description="Staff sign in with their email or mobile number. Guardians get portal access from the student's profile."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users & roles", href: "/admin/users" }, { label: "Add user" }]}
            />
            <Card className="max-w-3xl">
                <UserForm mode="create" roles={roles.map(({ id, label, role }) => ({ id, label, role }))} staffOptions={staffOptions} demo={isDemo} />
            </Card>
        </>
    );
}

