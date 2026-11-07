import Tabulation from "@/components/dash/Tabulation";
import { Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { getTabulation, listExams } from "@/lib/dashboard/exams";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Results" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function ResultsPage({ searchParams }) {
    const user = await requirePermission("exams.manage");
    const { exam: wanted } = await searchParams;
    const [all, sectionList] = await Promise.all([listExams(), listSectionOptions()]);
    const exams = all.map(({ id, name, status }) => ({ id, name, status }));
    const sections = sectionList.map(({ value, label }) => ({ value, label }));
    const examId = exams.find((e) => e.id === wanted)?.id ?? exams.findLast((e) => e.status === "LOCKED")?.id ?? exams.findLast((e) => e.status === "PUBLISHED")?.id ?? exams[0]?.id;

    // Demo: every tabulation up front (static). Live: the first section only; the rest load on demand.
    const data = {};
    if (isDemo) for (const e of exams) for (const s of sections) data[`${e.id}|${s.value}`] = await getTabulation(e.id, s.value);
    const first = !isDemo && examId && sections[0] ? await getTabulation(examId, sections[0].value) : null;
    const initial = first && { ...first, sectionId: sections[0].value };

    return (
        <>
            <PageHead title="Tabulation & results" description="Totals, GPA and position are calculated from the grade scale. Publishing freezes the result." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Exams", href: "/admin/exams" }, { label: "Results" }]} />
            <Card padded={false}>
                <Tabulation exams={exams} sections={sections} data={data} initial={initial} initialExam={examId} canPublish={can(user, "results.publish")} demo={isDemo} />
            </Card>
        </>
    );
}
