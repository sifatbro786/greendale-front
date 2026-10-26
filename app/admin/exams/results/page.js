import Tabulation from "@/components/dash/Tabulation";
import { Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { getTabulation, listExams } from "@/lib/dashboard/exams";

export const metadata = { title: "Results" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function ResultsPage() {
    const user = await requirePermission("exams.manage");
    const [exams, sections] = await Promise.all([listExams(), listSectionOptions()]);
    const data = {};
    for (const e of exams)
        for (const s of sections) {
            const t = await getTabulation(e.id, s.value);
            data[`${e.id}|${s.value}`] = {
                subjects: t.subjects,
                stats: t.stats,
                remarksMode: t.rows[0]?.remarksMode ?? false,
                rows: t.rows.map((r) => ({ roll: r.roll, name: r.name, marks: r.lines.map((l) => (l.absent ? "AB" : l.entered ? l.obtained : "—")), total: r.total, gpa: r.gpa, grade: r.grade, failed: r.failed, complete: r.complete, position: r.position })),
            };
        }
    return (
        <>
            <PageHead title="Tabulation & results" description="Totals, GPA and position are calculated from the grade scale. Publishing freezes the result." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Exams", href: "/admin/exams" }, { label: "Results" }]} />
            <Card padded={false}>
                <Tabulation exams={exams.map(({ id, name, status }) => ({ id, name, status }))} sections={sections.map(({ value, label }) => ({ value, label }))} data={data} canPublish={can(user.role, "results.publish")} />
            </Card>
        </>
    );
}
