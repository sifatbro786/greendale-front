import DataTable from "@/components/dash/DataTable";
import StudentAdmit from "@/components/dash/students/StudentAdmit";
import { Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions, listSessions, teacherSections } from "@/lib/dashboard/academics";
import { listStudents } from "@/lib/dashboard/students";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Students" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function StudentsPage() {
    const user = await requirePermission("students.view");
    const teacher = user.role === "TEACHER";
    const scope = teacher ? (await teacherSections(user.staffId)).map((s) => s.value) : undefined;
    const canManage = can(user, "students.manage");
    const [rows, sections, sessions] = await Promise.all([listStudents({ sectionIds: scope }), listSectionOptions(), canManage ? listSessions() : []]);
    const current = sessions.find((x) => x.isCurrent)?.name ?? "";
    const sectionOpts = sections.filter((s) => !scope || scope.includes(s.value));
    const showDues = can(user, "fees.view");

    const columns = [
        { key: "name", label: "Student", type: "person", sub: "studentUid", href: "/admin/students/{id}" },
        { key: "section", label: "Class", hideOnMobile: false },
        { key: "roll", label: "Roll", type: "number" },
        { key: "fatherName", label: "Father", hideOnMobile: true },
        { key: "guardianPhone", label: "Guardian mobile", hideOnMobile: true },
        ...(showDues ? [{ key: "due", label: "Dues", type: "money" }] : []),
        { key: "status", label: "Status", type: "badge" },
    ];

    return (
        <>
            <PageHead
                title={teacher ? "My classes" : "Students"}
                description={teacher ? "Students in the sections you teach. Guardian numbers are for school use only." : `${rows.length} students${current ? ` in session ${current}` : ""}. Each student keeps one profile for life; class and roll are stored per year.`}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: teacher ? "My classes" : "Students" }]}
                actions={canManage ? <StudentAdmit sections={sections.map(({ value, label }) => ({ value, label }))} sessions={sessions} demo={isDemo} /> : null}
            />
            <Card padded={false}>
                <DataTable
                    rows={rows}
                    columns={columns}
                    searchKeys={["name", "studentUid", "guardianPhone", "fatherName"]}
                    searchPlaceholder="Search name, ID or mobile"
                    filters={[
                        { key: "sectionId", label: "Class", options: sectionOpts },
                        { key: "status", label: "Status", options: [{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }] },
                    ]}
                    exportName="greendale-students"
                    pageSize={20}
                />
            </Card>
        </>
    );
}
