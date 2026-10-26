import { ClipboardList, FileSpreadsheet, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import DemoButton from "@/components/dash/DemoButton";
import { Badge, Card, PageHead, Progress } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { getGradeScale } from "@/lib/dashboard/academics";
import { EXAM_STATUSES, listExams } from "@/lib/dashboard/exams";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Exams & Results" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

const LABEL = { DRAFT: "Draft", MARKS_OPEN: "Marks open", LOCKED: "Locked", PUBLISHED: "Published" };

export default async function ExamsPage() {
    const user = await requireStaff();
    if (!can(user.role, "exams.manage")) {
        if (can(user.role, "marks.enter")) redirect("/admin/exams/marks");
        redirect("/admin");
    }
    const [exams, scale] = await Promise.all([listExams(), getGradeScale()]);

    return (
        <>
            <PageHead
                title="Exams & results"
                description="Exam → marks entry → automatic result → review → publish. Marks lock after publishing."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Exams & results" }]}
                actions={
                    <>
                        <Link href="/admin/exams/marks" className="btn-ghost min-h-10 text-[14px]">
                            <ClipboardList className="size-4" aria-hidden="true" /> Marks entry
                        </Link>
                        <Link href="/admin/exams/results" className="btn-ghost min-h-10 text-[14px]">
                            <FileSpreadsheet className="size-4" aria-hidden="true" /> Tabulation
                        </Link>
                        <DemoButton className="btn-primary min-h-10 text-[14px]">
                            <Plus className="size-4" aria-hidden="true" /> New exam
                        </DemoButton>
                    </>
                }
            />

            <div className="grid gap-4 lg:grid-cols-3">
                {exams.map((e) => {
                    const step = EXAM_STATUSES.indexOf(e.status);
                    return (
                        <Card key={e.id}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-[17px] font-semibold text-ink">{e.name}</h2>
                                    <p className="text-[13.5px] text-ink-soft">
                                        {formatDate(e.startDate)} – {formatDate(e.endDate)}
                                    </p>
                                </div>
                                <Badge tone={e.status === "PUBLISHED" ? "green" : e.status === "MARKS_OPEN" ? "blue" : "yellow"}>{LABEL[e.status]}</Badge>
                            </div>
                            <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Status">
                                {EXAM_STATUSES.map((s, i) => (
                                    <li key={s} className="text-center">
                                        <span className={`block h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-ink/10"}`} />
                                        <span className={`mt-1.5 block text-[11px] ${i === step ? "font-semibold text-ink" : "text-ink-soft"}`}>{LABEL[s]}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-5">
                                <p className="mb-1.5 text-[13px] text-ink-soft">Marks entered</p>
                                <Progress value={e.progress} tone={e.progress === 100 ? "brand" : "sky"} label={`${e.name} marks entered`} />
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {e.status === "MARKS_OPEN" && (
                                    <DemoButton className="btn-ghost min-h-9 px-3.5 text-[13.5px]" title="Marks entry locked" message="Demo: marks entry would close so the principal can review the tabulation.">
                                        Lock marks
                                    </DemoButton>
                                )}
                                {e.status === "PUBLISHED" && user.role === "SUPER_ADMIN" && (
                                    <DemoButton className="btn-ghost min-h-9 px-3.5 text-[13.5px]" title="Unpublish" message="Demo: only the Super Admin can unpublish; it is written to the audit log.">
                                        Unpublish
                                    </DemoButton>
                                )}
                                <Link href="/admin/exams/results" className="btn-ghost min-h-9 px-3.5 text-[13.5px]">
                                    Tabulation
                                </Link>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card title="Grade scale" description="Class I to V. Play Group to KG get a progress report with remarks." className="mt-4" padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-line bg-paper/60 text-[12.5px] tracking-wide text-ink-soft uppercase">
                                <th className="px-5 py-2.5 font-semibold">Marks (%)</th>
                                <th className="px-5 py-2.5 font-semibold">Grade</th>
                                <th className="px-5 py-2.5 font-semibold">Point</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scale.map((g) => (
                                <tr key={g.grade} className="border-b border-line last:border-0">
                                    <td className="px-5 py-2.5 tabular-nums">
                                        {g.minPercent} – {g.maxPercent}
                                    </td>
                                    <td className="px-5 py-2.5 font-semibold">{g.grade}</td>
                                    <td className="px-5 py-2.5 tabular-nums">{g.point.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}
