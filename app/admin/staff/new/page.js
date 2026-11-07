import StaffForm from "@/components/dash/academics/StaffForm";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Add staff" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function NewStaffPage() {
    await requirePermission("academics.manage");
    return (
        <>
            <PageHead
                title="Add staff"
                description="A staff record for a teacher or office member. Their login (if any) is created in Users & roles."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Teachers & staff", href: "/admin/staff" }, { label: "Add staff" }]}
            />
            <Card>
                <StaffForm demo={isDemo} />
            </Card>
        </>
    );
}
