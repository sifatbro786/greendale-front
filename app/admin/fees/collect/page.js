import FeeCollector from "@/components/dash/FeeCollector";
import { PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { db, enrollmentByStudent, feeHeadMap, invoiceDue, sectionLabel } from "@/lib/dashboard/_shared";
import { monthLabel } from "@/lib/dashboard/fees";

export const metadata = { title: "Collect fee" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function CollectPage() {
    const user = await requirePermission("fees.collect");
    const students = db.students
        .filter((s) => s.status === "ACTIVE")
        .map((s) => {
            const en = enrollmentByStudent.get(s.id);
            const dues = db.invoices
                .filter((i) => i.studentId === s.id)
                .map((i) => ({ id: i.id, head: feeHeadMap.get(i.feeHeadId).name, period: feeHeadMap.get(i.feeHeadId).type === "MONTHLY" ? monthLabel(i.month) : "One time", month: i.month, due: invoiceDue(i) }))
                .filter((d) => d.due > 0)
                .sort((a, b) => a.month.localeCompare(b.month));
            return { id: s.id, name: s.name, studentUid: s.studentUid, section: sectionLabel(en.sectionId), roll: en.roll, dues, due: dues.reduce((a, d) => a + d.due, 0) };
        })
        .sort((a, b) => b.due - a.due);
    const next = `GEVS-2026-${String(db.payments.length + 1).padStart(5, "0")}`;
    return (
        <>
            <PageHead title="Collect fee" description="Find the student, tick the dues being paid, print the receipt." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Fees", href: "/admin/fees" }, { label: "Collect" }]} />
            <FeeCollector students={students} nextReceiptNo={next} collector={user.name} />
        </>
    );
}
