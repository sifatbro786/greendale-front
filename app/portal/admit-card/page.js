import { UserRound } from "lucide-react";
import Image from "next/image";

import PrintButton from "@/components/dash/PrintButton";
import { EmptyState, PageHead } from "@/components/dash/ui";
import { school } from "@/config/school";
import { requireStudent } from "@/lib/auth/session";
import { admitCard } from "@/lib/dashboard/exams";
import { getStudent } from "@/lib/dashboard/students";
import { formatDate, formatMoney } from "@/lib/format";
import { isLive } from "@/lib/mode";

export const metadata = { title: "Admit card" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalAdmitCard() {
    const user = await requireStudent();
    // The API decides the hold (setting cards.admitHoldAbove), so it cannot be bypassed from the page.
    const [s, card] = await Promise.all([getStudent(user.studentId), admitCard(user.studentId)]);
    const { exam, schedule = [], held, due } = card ?? {};
    return (
        <>
            <PageHead title="Admit card" description="Download the admit card once the school generates it for the upcoming exam." actions={exam && !held && <PrintButton label="Print / Save PDF" />} />
            {!exam ? (
                <EmptyState title="No upcoming exam" text="The admit card appears here when the school schedules the next exam." icon="IdCard" />
            ) : held ? (
                <div className="rounded-2xl border border-line bg-white">
                    <EmptyState title="Admit card on hold" text={`Dues of ${formatMoney(due)} are pending. Please clear dues to download the admit card, or contact the office.`} icon="CircleAlert" />
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
                    {exam.startDate && <p className="text-center text-[13px] text-ink-soft">Starts {formatDate(exam.startDate, { day: "numeric", month: "long", year: "numeric" })}</p>}
                    <div className="mt-5 flex gap-5">
                        <div className="grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper text-ink-soft">
                            {isLive && s.hasPhoto ? (
                                // Private photo: served by the API with the guardian's own-scope check
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`/api/students/${s.id}/photo`} alt="" className="size-full object-cover" />
                            ) : (
                                <UserRound className="size-9" aria-hidden="true" />
                            )}
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
                    {schedule.some((x) => x.date) && (
                        <table className="mt-5 w-full text-[13.5px]">
                            <thead>
                                <tr className="border-b border-line text-left text-[11.5px] tracking-wide text-ink-soft uppercase">
                                    <th className="py-1.5 font-semibold">Date</th>
                                    <th className="py-1.5 font-semibold">Time</th>
                                    <th className="py-1.5 font-semibold">Subject</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((x) => (
                                    <tr key={x.subject} className="border-b border-line/70 last:border-0">
                                        <td className="py-1.5 tabular-nums">{x.date ? formatDate(x.date, { weekday: "short", day: "numeric", month: "short" }) : "—"}</td>
                                        <td className="py-1.5 tabular-nums">{x.time ?? "—"}</td>
                                        <td className="py-1.5 font-medium">{x.subject}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
