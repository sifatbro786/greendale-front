import { UserRound } from "lucide-react";
import Image from "next/image";

import PrintButton from "@/components/dash/PrintButton";
import { EmptyState, PageHead } from "@/components/dash/ui";
import { school } from "@/config/school";
import { requireStudent } from "@/lib/auth/session";
import { upcomingExams } from "@/lib/dashboard/exams";
import { studentLedger } from "@/lib/dashboard/fees";
import { getStudent } from "@/lib/dashboard/students";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Admit card" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

const HOLD_ABOVE = 3000; // Setting: hold admit card if dues are above this amount

export default async function PortalAdmitCard() {
    const user = await requireStudent();
    const [s, exams, ledger] = await Promise.all([getStudent(user.studentId), upcomingExams(), studentLedger(user.studentId)]);
    const exam = exams[0];
    const held = ledger.totals.due > HOLD_ABOVE;
    return (
        <>
            <PageHead title="Admit card" description="Download the admit card once the school generates it for the upcoming exam." actions={exam && !held && <PrintButton label="Print / Save PDF" />} />
            {!exam ? (
                <EmptyState title="No upcoming exam" text="The admit card appears here when the school schedules the next exam." icon="IdCard" />
            ) : held ? (
                <div className="rounded-2xl border border-line bg-white">
                    <EmptyState title="Admit card on hold" text={`Dues of ${formatMoney(ledger.totals.due)} are pending. Please clear dues to download the admit card, or contact the office.`} icon="CircleAlert" />
                </div>
            ) : (
                <article className="mx-auto max-w-2xl rounded-2xl border-2 border-brand/70 bg-white p-6 print:border-brand">
                    <header className="flex items-center gap-3 border-b border-dashed border-line pb-4">
                        <Image src={school.logo.crest} alt="" width={school.logo.width} height={school.logo.height} className="h-14 w-auto" />
                        <div className="leading-tight">
                            <p className="font-bold tracking-wide text-brand-deep">GREENDALE ENGLISH VERSION SCHOOL</p>
                            <p className="text-[12.5px] text-ink-soft">
                                {school.contact.addressShort} · EIIN {school.eiin}
                            </p>
                        </div>
                    </header>
                    <p className="mt-4 text-center text-[14px] font-bold tracking-[0.2em] uppercase">Admit card · {exam.name}</p>
                    <p className="text-center text-[13px] text-ink-soft">Starts {formatDate(exam.startDate, { day: "numeric", month: "long", year: "numeric" })}</p>
                    <div className="mt-5 flex gap-5">
                        <div className="grid h-28 w-24 shrink-0 place-items-center rounded-lg border border-line bg-paper text-ink-soft">
                            <UserRound className="size-9" aria-hidden="true" />
                        </div>
                        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-[14px]">
                            <dt className="text-ink-soft">Name</dt>
                            <dd className="font-semibold">{s.name}</dd>
                            <dt className="text-ink-soft">Class</dt>
                            <dd className="font-semibold">{s.section}</dd>
                            <dt className="text-ink-soft">Roll</dt>
                            <dd className="font-semibold">{s.roll}</dd>
                            <dt className="text-ink-soft">Student ID</dt>
                            <dd className="font-semibold">{s.studentUid}</dd>
                        </dl>
                    </div>
                    <ul className="mt-5 list-disc space-y-1 pl-5 text-[12.5px] text-ink-soft">
                        <li>Bring this card and a pencil box on every exam day.</li>
                        <li>Reach school 15 minutes before the exam starts.</li>
                    </ul>
                    <footer className="mt-8 flex justify-between text-[12px] text-ink-soft">
                        <span className="border-t border-ink/30 pt-1">Class teacher</span>
                        <span className="border-t border-ink/30 pt-1">Principal</span>
                    </footer>
                </article>
            )}
        </>
    );
}
