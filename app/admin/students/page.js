import DataTable from "@/components/dash/DataTable";
import StudentActions from "@/components/dash/StudentActions";
import { Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions, teacherSections } from "@/lib/dashboard/academics";
import { listStudents } from "@/lib/dashboard/students";

export const metadata = { title: "Students" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function StudentsPage() {
    const user = await requirePermission("students.view");
    const teacher = user.role === "TEACHER";
    const scope = teacher ? (await teacherSections(user.staffId)).map((s) => s.value) : undefined;
    const [rows, sections] = await Promise.all([listStudents({ sectionIds: scope }), listSectionOptions()]);
    const sectionOpts = sections.filter((s) => !scope || scope.includes(s.value));
    const showDues = can(user.role, "fees.view");

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
                description={teacher ? "Students in the sections you teach. Guardian numbers are for school use only." : `${rows.length} students in session 2026. Each student keeps one profile for life; class and roll are stored per year.`}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: teacher ? "My classes" : "Students" }]}
                actions={can(user.role, "students.manage") ? <StudentActions sections={sections} /> : null}
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
