import MarksEntry from "@/components/dash/MarksEntry";
import { PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { db, sectionLabel, subjectMap } from "@/lib/dashboard/_shared";
import { getMarksSheet, listExams } from "@/lib/dashboard/exams";

export const metadata = { title: "Marks entry" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function MarksPage() {
    const user = await requirePermission("marks.enter");
    // Teacher sees only assigned section+subject pairs (PRD §6.3: Teacher A cannot load Teacher B's subject).
    const pairs = db.assignments.filter((a) => user.role !== "TEACHER" || a.staffId === user.staffId);
    const exams = (await listExams()).map(({ id, name, status }) => ({ id, name, status }));
    const options = pairs.map((a) => ({ value: `${a.sectionId}|${a.subjectId}`, label: `${sectionLabel(a.sectionId)} · ${subjectMap.get(a.subjectId).name}` }));
    const sheets = {};
    for (const e of exams) {
        for (const a of pairs) {
            const s = await getMarksSheet(e.id, a.sectionId, a.subjectId);
            if (s) sheets[`${e.id}|${a.sectionId}|${a.subjectId}`] = { ...s, rows: s.rows };
        }
    }
    const open = exams.find((e) => e.status === "MARKS_OPEN")?.id ?? exams[0].id;

    return (
        <>
            <PageHead
                title="Marks entry"
                description={user.role === "TEACHER" ? "Only your assigned subjects are listed. Press Enter to jump to the next student." : "Enter or review marks for any class and subject."}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Exams", href: "/admin/exams" }, { label: "Marks entry" }]}
            />
            <MarksEntry exams={exams} options={options} sheets={sheets} initialExam={open} />
        </>
    );
}
