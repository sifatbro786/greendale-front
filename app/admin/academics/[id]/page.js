import { notFound } from "next/navigation";

import ClassManager from "@/components/dash/academics/ClassManager";
import { Badge, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { getClassDetail, listStaff } from "@/lib/dashboard/academics";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Class" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function ClassPage({ params }) {
    await requirePermission("academics.manage");
    const { id } = await params;
    const [cls, staff] = await Promise.all([getClassDetail(id), listStaff()]);
    if (!cls) notFound();
    return (
        <>
            <PageHead
                title={cls.name}
                description={`Sections, subjects and teachers for session ${cls.session.name}.`}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Classes & subjects", href: "/admin/academics" }, { label: cls.name }]}
                actions={<Badge tone={cls.gradingMode === "MARKS" ? "blue" : "yellow"}>{cls.gradingMode === "MARKS" ? "Marks & GPA" : "Remarks"}</Badge>}
            />
            <ClassManager cls={cls} staff={staff.filter((t) => t.isActive !== false).map(({ id: sid, name }) => ({ id: sid, name }))} demo={isDemo} />
        </>
    );
}
