import { Plus } from "lucide-react";

import DemoButton from "@/components/dash/DemoButton";
import { Badge, Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { listClasses, listSessions } from "@/lib/dashboard/academics";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Classes & subjects" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function AcademicsPage() {
    await requirePermission("academics.manage");
    const [classes, sessions] = await Promise.all([listClasses(), listSessions()]);
    return (
        <>
            <PageHead
                title="Classes & subjects"
                description="Academic sessions, classes, sections and subjects. Promotion moves a whole class to the next one in a single step."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Classes & subjects" }]}
                actions={
                    <>
                        <DemoButton className="btn-ghost min-h-10 text-[14px]" title="Promotion preview" message="Demo: pick a class, map it to the next class and preview new rolls (by result position or kept) before confirming. Runs in one transaction.">
                            Promote students
                        </DemoButton>
                        <DemoButton className="btn-primary min-h-10 text-[14px]">
                            <Plus className="size-4" aria-hidden="true" /> Add class
                        </DemoButton>
                    </>
                }
            />
            <Card title="Academic sessions" padded={false} className="mb-4">
                <ul className="divide-y divide-line">
                    {sessions.map((s) => (
                        <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                            <span className="font-semibold text-ink">Session {s.name}</span>
                            <span className="text-[14px] text-ink-soft">
                                {formatDate(s.startDate)} – {formatDate(s.endDate)}
                            </span>
                            {s.isCurrent ? <Badge tone="green">Current</Badge> : <Badge>Closed</Badge>}
                        </li>
                    ))}
                </ul>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {classes.map((c) => (
                    <Card key={c.id}>
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-lg font-semibold text-ink">{c.name}</h2>
                            <Badge tone={c.gradingMode === "MARKS" ? "blue" : "yellow"}>{c.gradingMode === "MARKS" ? "Marks & GPA" : "Remarks"}</Badge>
                        </div>
                        {c.sections.map((s) => (
                            <p key={s.id} className="mt-2 text-[14px] text-ink-soft">
                                Section {s.name} · <b className="text-ink">{s.students}</b> students
                                <br />
                                Class teacher: {s.classTeacher ?? "—"}
                            </p>
                        ))}
                        <p className="mt-4 text-[12px] font-semibold tracking-wide text-ink-soft uppercase">Subjects</p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                            {c.subjects.map((s) => (
                                <li key={s} className="rounded-md bg-paper px-2 py-1 text-[12.5px] text-ink">
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>
        </>
    );
}
