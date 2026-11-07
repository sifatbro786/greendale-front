import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Avatar, Badge, Card, StatCard } from "@/components/dash/ui";
import { hasModule } from "@/lib/auth/permissions";
import { requireStudent } from "@/lib/auth/session";
import { studentAttendanceMonth, today as todayFn } from "@/lib/dashboard/attendance";
import { portalNotices } from "@/lib/dashboard/comms";
import { studentResults, upcomingExams } from "@/lib/dashboard/exams";
import { studentLedger } from "@/lib/dashboard/fees";
import { getRoutine } from "@/lib/dashboard/routine";
import { getStudent } from "@/lib/dashboard/students";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Home" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalHome() {
    const user = await requireStudent();
    const s = await getStudent(user.studentId);
    const TODAY = todayFn(); // after the auth read (cache components)
    const [month, results, ledger, notices, exams, routine] = await Promise.all([
        hasModule(user, "attendance") ? studentAttendanceMonth(s.id, TODAY.slice(0, 7)) : null,
        hasModule(user, "results") ? studentResults(s.id) : [],
        hasModule(user, "fees") ? studentLedger(s.id) : null,
        portalNotices(s.id),
        hasModule(user, "results") ? upcomingExams() : [],
        s.sectionId && hasModule(user, "routine") ? getRoutine({ sectionId: s.sectionId }) : null,
    ]);
    const latest = results.at(-1);
    const att = month ?? { present: 0, late: 0, absent: 0 };
    const rate = att.present + att.late + att.absent ? Math.round(((att.present + att.late) / (att.present + att.late + att.absent)) * 100) : 0;
    // Today's class routine for the student's section
    const day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(`${TODAY}T00:00:00Z`).getUTCDay()];
    const periods = new Map((routine?.periods ?? []).map((p) => [p.id, p]));
    const todaySlots = (routine?.cells ?? [])
        .filter((c) => c.day === day && periods.has(c.periodId))
        .map((c) => ({ ...c, id: `${c.day}-${c.periodId}`, period: periods.get(c.periodId) }))
        .sort((a, b) => a.period.number - b.period.number);

    return (
        <>
            <section className="relative overflow-hidden rounded-3xl bg-brand-deep p-6 text-white sm:p-8">
                <div className="dot-grid absolute inset-0 opacity-20" aria-hidden="true" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                    <Avatar name={s.name} size="lg" tone="sun" />
                    <div className="flex-1">
                        <p className="text-[14px] text-white/70">Welcome back</p>
                        <h1 className="text-2xl font-semibold sm:text-3xl">{s.name}</h1>
                        <p className="mt-1 text-[15px] text-white/80">
                            {s.section} · Roll {s.roll} · {s.studentUid}
                        </p>
                    </div>
                    {!ledger ? null : ledger.totals.due > 0 ? (
                        <Link href="/portal/fees" className="btn-sun w-max">
                            Pay {formatMoney(ledger.totals.due)}
                        </Link>
                    ) : (
                        <Badge tone="green">All fees paid</Badge>
                    )}
                </div>
            </section>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Attendance this month" value={`${rate}%`} hint={`${att.absent} absent · ${att.late} late`} icon="CalendarCheck" href="/portal/attendance" />
                <StatCard label="Latest result" value={latest ? (latest.gpa != null ? `GPA ${latest.gpa.toFixed(2)}` : "Published") : "—"} hint={latest ? `${latest.exam.name}${latest.grade ? ` · ${latest.grade}` : " · progress report"}` : "No published result"} icon="Award" tone="sun" href="/portal/results" />
                {ledger && <StatCard label="Current dues" value={formatMoney(ledger.totals.due)} hint={ledger.totals.due ? "Pay online or at the office" : "Nothing due"} icon="Wallet" tone={ledger.totals.due ? "coral" : "brand"} href="/portal/fees" />}
                <StatCard label="Next exam" value={exams[0]?.startDate ? formatDate(exams[0].startDate, { day: "numeric", month: "short" }) : exams[0] ? "Soon" : "—"} hint={exams[0]?.name} icon="ClipboardList" tone="sky" href="/portal/admit-card" />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Card title="Today's classes" padded={false}>
                    {todaySlots.length ? (
                        <ol className="divide-y divide-line">
                            {todaySlots.map((c) => (
                                <li key={c.id} className="flex items-center gap-4 px-5 py-3">
                                    <span className="w-24 text-[13px] text-ink-soft tabular-nums">
                                        {c.period.start}–{c.period.end}
                                    </span>
                                    <span className="font-medium text-ink">{c.subject}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="px-5 py-10 text-center text-ink-soft">No classes today.</p>
                    )}
                </Card>
                <Card title="Notices" padded={false} actions={<Link href="/portal/notices" className="text-[13.5px] font-semibold text-brand-deep">All →</Link>}>
                    <ul className="divide-y divide-line">
                        {notices.slice(0, 4).map((n) => (
                            <li key={n.id} className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                    <Badge tone={n.scope === "Your class" ? "yellow" : n.scope === "Website" ? "gray" : "blue"}>{n.scope}</Badge>
                                    <span className="text-[12.5px] text-ink-soft">{formatDate(n.publishedAt)}</span>
                                </div>
                                <p className="mt-1 font-medium text-ink">{n.title}</p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                    ["/portal/results", "Download marksheet", "Every published exam"],
                    ["/portal/admit-card", "Admit card", "For the upcoming exam"],
                    ["/portal/routine", "Class routine", "Full week"],
                ].map(([href, t, d]) => (
                    <Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 hover:border-brand">
                        <span>
                            <span className="block font-semibold text-ink">{t}</span>
                            <span className="text-[13px] text-ink-soft">{d}</span>
                        </span>
                        <ArrowRight className="size-4 text-ink-soft group-hover:text-brand" aria-hidden="true" />
                    </Link>
                ))}
            </div>
        </>
    );
}
