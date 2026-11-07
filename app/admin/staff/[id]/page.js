import { notFound } from "next/navigation";

import StaffForm from "@/components/dash/academics/StaffForm";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { getStaffMember } from "@/lib/dashboard/academics";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Staff" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function StaffMemberPage({ params }) {
    await requirePermission("academics.manage");
    const { id } = await params;
    const member = await getStaffMember(id);
    if (!member) notFound();
    return (
        <>
            <PageHead
                title={member.name}
                description={member.designation}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Teachers & staff", href: "/admin/staff" }, { label: member.name }]}
            />
            <Card>
                <StaffForm key={JSON.stringify(member)} member={member} demo={isDemo} />
            </Card>
        </>
    );
}
