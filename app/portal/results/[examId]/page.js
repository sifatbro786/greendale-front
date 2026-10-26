import Image from "next/image";
import { notFound } from "next/navigation";

import PrintButton from "@/components/dash/PrintButton";
import { PageHead } from "@/components/dash/ui";
import { school } from "@/config/school";
import { requireStudent } from "@/lib/auth/session";
import { studentMarksheet } from "@/lib/dashboard/exams";
import { getStudent } from "@/lib/dashboard/students";

export const metadata = { title: "Marksheet" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function MarksheetPage({ params }) {
    const user = await requireStudent();
    const { examId } = await params;
    // Unpublished or unknown exam → 404 (guardians never see drafts).
    const r = await studentMarksheet(user.studentId, examId);
    if (!r) notFound();
    const s = await getStudent(user.studentId);
    return (
        <>
            <div className="print:hidden">
                <PageHead title="Marksheet" crumbs={[{ label: "Results", href: "/portal/results" }, { label: r.exam.name }]} actions={<PrintButton label="Print / Save PDF" />} />
            </div>
            <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-6 sm:p-10 print:border-0 print:p-0">
                <header className="text-center">
                    <Image src={school.logo.crest} alt="" width={school.logo.width} height={school.logo.height} className="mx-auto h-16 w-auto" />
                    <p className="mt-2 text-xl font-bold tracking-wide text-brand-deep">GREENDALE ENGLISH VERSION SCHOOL</p>
                    <p className="text-[13px] text-ink-soft">
                        {school.contact.addressShort} · EIIN {school.eiin}
                    </p>
                    <p className="mt-3 inline-block rounded-full bg-brand px-4 py-1 text-[13px] font-semibold tracking-wider text-white uppercase">Academic transcript · {r.exam.name}</p>
                </header>
                <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-paper p-4 text-[14px] sm:grid-cols-4">
                    <div>
                        <dt className="text-ink-soft">Name</dt>
                        <dd className="font-semibold">{s.name}</dd>
                    </div>
                    <div>
                        <dt className="text-ink-soft">Class</dt>
                        <dd className="font-semibold">{s.section}</dd>
                    </div>
                    <div>
                        <dt className="text-ink-soft">Roll</dt>
                        <dd className="font-semibold">{s.roll}</dd>
                    </div>
                    <div>
                        <dt className="text-ink-soft">Student ID</dt>
                        <dd className="font-semibold">{s.studentUid}</dd>
                    </div>
                </dl>
                <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[420px] text-[14.5px]">
                    <thead>
                        <tr className="border-b-2 border-brand text-left text-[12.5px] tracking-wide text-ink-soft uppercase">
                            <th className="py-2 font-semibold">Subject</th>
                            <th className="px-2 py-2 text-right font-semibold">Full</th>
                            <th className="px-2 py-2 text-right font-semibold">Obtained</th>
                            <th className="px-2 py-2 text-center font-semibold">Grade</th>
                            <th className="py-2 text-right font-semibold">Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        {r.lines.map((l) => (
                            <tr key={l.subject} className="border-b border-line">
                                <td className="py-2.5">{l.subject}</td>
                                <td className="py-2.5 text-right tabular-nums">{l.full}</td>
                                <td className={`py-2.5 text-right font-medium tabular-nums ${l.absent || l.point === 0 ? "text-coral" : ""}`}>{l.absent ? "Absent" : l.obtained}</td>
                                <td className="py-2.5 text-center font-semibold">{l.grade}</td>
                                <td className="py-2.5 text-right tabular-nums">{l.point.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        ["Total", `${r.total} / ${r.fullTotal}`],
                        ["GPA", r.gpa.toFixed(2)],
                        ["Grade", r.grade],
                        ["Position", `${r.position} of ${r.outOf}`],
                    ].map(([k, v]) => (
                        <div key={k} className="rounded-xl border border-line p-3 text-center">
                            <p className="text-[12px] tracking-wide text-ink-soft uppercase">{k}</p>
                            <p className="mt-0.5 text-lg font-semibold">{v}</p>
                        </div>
                    ))}
                </div>
                <footer className="mt-12 flex justify-between text-[12.5px] text-ink-soft">
                    <span className="border-t border-ink/30 pt-1">Class teacher</span>
                    <span className="border-t border-ink/30 pt-1">Principal</span>
                </footer>
                <p className="mt-6 text-center text-[11.5px] text-ink-soft">Online copy for reference. The signed marksheet from the school is the official record.</p>
            </article>
        </>
    );
}
