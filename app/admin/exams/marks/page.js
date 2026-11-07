import MarksEntry from "@/components/dash/MarksEntry";
import { PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { getMarksSheet, listExams, marksOptions } from "@/lib/dashboard/exams";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Marks entry" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function MarksPage() {
    const user = await requirePermission("marks.enter");
    // Teachers get only their assigned section + subject pairs (the API enforces it too: 404 otherwise).
    const [all, pairs] = await Promise.all([listExams(), marksOptions(user)]);
    const exams = all.map(({ id, name, status }) => ({ id, name, status }));
    const options = pairs.map(({ value, label }) => ({ value, label }));
    const open = exams.find((e) => e.status === "MARKS_OPEN")?.id ?? exams.at(-1)?.id;

    // Demo: every sheet up front (static). Live: only the first sheet; the rest load on demand.
    const sheets = {};
    if (isDemo) for (const e of exams) for (const p of pairs) {
        const s = await getMarksSheet(e.id, p.sectionId, p.subjectId);
        if (s) sheets[`${e.id}|${p.value}`] = s;
    }
    const initial = !isDemo && open && pairs[0] ? await getMarksSheet(open, pairs[0].sectionId, pairs[0].subjectId) : null;

    return (
        <>
            <PageHead
                title="Marks entry"
                description={user.role === "TEACHER" ? "Only your assigned subjects are listed. Press Enter to jump to the next student, then Save." : "Enter or review marks for any class and subject."}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Exams", href: "/admin/exams" }, { label: "Marks entry" }]}
            />
            <MarksEntry exams={exams} options={options} sheets={sheets} initial={initial} initialExam={open} demo={isDemo} />
        </>
    );
}
