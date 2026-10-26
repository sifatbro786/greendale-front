import { ArrowRight, CalendarCheck, ClipboardList, HandCoins, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { BarChart, LineChart } from "@/components/dash/charts";
import Greeting from "@/components/dash/Greeting";
import { Badge, Card, PageHead, Progress, StatCard } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { teacherSections } from "@/lib/dashboard/academics";
import { attendanceSummary, attendanceTrend, TODAY } from "@/lib/dashboard/attendance";
import { listStaffNotices } from "@/lib/dashboard/comms";
import { listExams, upcomingExams } from "@/lib/dashboard/exams";
import { feeSummary } from "@/lib/dashboard/fees";
import { teacherToday } from "@/lib/dashboard/routine";
import { studentCounts } from "@/lib/dashboard/students";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Dashboard" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function DashboardPage() {
    const user = await requireStaff();
    if (user.role === "TEACHER") return <TeacherHome user={user} />;

    const [counts, att, trend, fees, exams, notices] = await Promise.all([studentCounts(), attendanceSummary(), attendanceTrend(14), feeSummary(), upcomingExams(), listStaffNotices()]);
    const first = user.name.split(" ")[0];
    const canFees = can(user.role, "fees.view");

    return (
        <>
            <PageHead
                title={<Greeting name={first} />}
                description={`Here is Greendale today, ${formatDate(TODAY, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`}
                actions={
                    <>
                        {can(user.role, "fees.collect") && (
                            <Link href="/admin/fees/collect" className="btn-primary min-h-10 text-[14px]">
                                <HandCoins className="size-4" aria-hidden="true" /> Collect fee
                            </Link>
                        )}
                        <Link href="/admin/attendance" className="btn-ghost min-h-10 text-[14px]">
                            <CalendarCheck className="size-4" aria-hidden="true" /> Attendance
                        </Link>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Active students" value={counts.total} hint={`${counts.boys} boys · ${counts.girls} girls · ${counts.newThisYear} new this year`} icon="Users" href="/admin/students" />
                <StatCard
                    label="Attendance today"
                    value={att.rate == null ? "—" : `${att.rate}%`}
                    hint={att.pending.length ? `${att.pending.length} class pending: ${att.pending.join(", ")}` : "All classes taken"}
                    icon="CalendarCheck"
                    tone="sky"
                    href="/admin/attendance/reports"
                />
                {canFees ? (
                    <>
                        <StatCard label="Collected today" value={formatMoney(fees.today)} hint={`${fees.todayCount} receipts · ${formatMoney(fees.thisMonth)} this month`} icon="Wallet" tone="sun" href="/admin/fees/payments" />
                        <StatCard label="Total dues" value={formatMoney(fees.totalDue)} hint={`${fees.defaulters} students with dues`} icon="CircleAlert" tone="coral" href="/admin/fees" />
                    </>
                ) : (
                    <>
                        <StatCard label="Upcoming exam" value={exams[0]?.name.replace(" Examination", "") ?? "—"} hint={exams[0] ? `Starts ${formatDate(exams[0].startDate)}` : ""} icon="ClipboardList" tone="sun" href="/admin/exams" />
                        <StatCard label="Staff notices" value={notices.length} hint="Latest from the office" icon="Megaphone" tone="coral" href="/admin/notices" />
                    </>
                )}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card title="Attendance, last 14 school days" description="Present + late as a share of students marked">
                    <LineChart data={trend.map((t) => ({ label: formatDate(t.date, { day: "numeric", month: "short" }), value: t.rate }))} unit="%" min={80} max={100} ariaLabel="Daily attendance rate for the last 14 school days" />
                </Card>
                {canFees ? (
                    <Card title="Fee collection by month" description="Valid payments, session 2026" actions={<Link href="/admin/fees" className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">Details →</Link>}>
                        <BarChart data={fees.byMonth} unit="৳" ariaLabel="Fee collection by month" />
                    </Card>
                ) : (
                    <Card title="Students by class">
                        <BarChart data={counts.byClass.map((c) => ({ label: c.label.replace("Class ", ""), value: c.value }))} highlightLast={false} ariaLabel="Students by class" />
                    </Card>
                )}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Card title="Today by class" padded={false} actions={<Link href="/admin/attendance" className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">Take →</Link>}>
                    <ul className="divide-y divide-line">
                        {att.sections.map((s) => (
                            <li key={s.sectionId} className="px-5 py-3">
                                <div className="mb-1.5 flex items-center justify-between text-[14px]">
                                    <span className="font-medium text-ink">{s.section}</span>
                                    {s.taken ? (
                                        <span className="text-ink-soft">
                                            {s.absent} absent{s.late ? ` · ${s.late} late` : ""}
                                        </span>
                                    ) : (
                                        <Badge tone="yellow">Not taken</Badge>
                                    )}
                                </div>
                                {s.taken && <Progress value={Math.round(((s.present + s.late) / s.total) * 100)} label={`${s.section} attendance`} />}
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Exams" padded={false} actions={<Link href="/admin/exams" className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">Open →</Link>}>
                    <ExamList />
                </Card>

                <Card title="Latest notices" padded={false} actions={<Link href="/admin/notices" className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">All →</Link>}>
                    <ul className="divide-y divide-line">
                        {notices.slice(0, 5).map((n) => (
                            <li key={n.id} className="px-5 py-3.5">
                                <p className="text-[14.5px] font-medium text-ink">{n.title}</p>
                                <p className="mt-0.5 text-[12.5px] text-ink-soft">
                                    {formatDate(n.publishedAt)} {n.pinned && "· Pinned"}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <QuickLink href="/admin/students" icon={<ClipboardList className="size-5" aria-hidden="true" />} title="Student list" text="Search, profiles, print lists" />
                <QuickLink href="/admin/exams/results" icon={<ClipboardList className="size-5" aria-hidden="true" />} title="Tabulation sheet" text="Review and publish results" />
                <QuickLink href="/admin/sms" icon={<MessageSquareText className="size-5" aria-hidden="true" />} title="Send SMS" text="Notices, dues, results" />
                <QuickLink href="/admin/cards" icon={<CalendarCheck className="size-5" aria-hidden="true" />} title="Admit cards" text="Generate for a class" />
            </div>
        </>
    );
}

async function ExamList() {
    const exams = await listExams();
    return (
        <ul className="divide-y divide-line">
            {exams.map((e) => (
                <li key={e.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[14.5px] font-medium text-ink">{e.name}</p>
                        <Badge tone={e.status === "PUBLISHED" ? "green" : e.status === "MARKS_OPEN" ? "blue" : "yellow"}>{e.status === "MARKS_OPEN" ? "Marks open" : e.status.charAt(0) + e.status.slice(1).toLowerCase()}</Badge>
                    </div>
                    <p className="mt-0.5 mb-2 text-[12.5px] text-ink-soft">
                        {formatDate(e.startDate)} – {formatDate(e.endDate)}
                    </p>
                    <Progress value={e.progress} tone={e.progress === 100 ? "brand" : "sky"} label={`${e.name} marks entered`} />
                </li>
            ))}
        </ul>
    );
}

function QuickLink({ href, icon, title, text }) {
    return (
        <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 hover:border-brand">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
            <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{title}</span>
                <span className="block text-[13px] text-ink-soft">{text}</span>
            </span>
            <ArrowRight className="size-4 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
        </Link>
    );
}

/* ------------------------------ Teacher ------------------------------ */
async function TeacherHome({ user }) {
    const [today, sections, att, notices, exams] = await Promise.all([teacherToday(user.staffId, TODAY), teacherSections(user.staffId), attendanceSummary(), listStaffNotices(), listExams()]);
    const mySections = att.sections.filter((s) => sections.some((x) => x.value === s.sectionId));
    const classTeacherOf = sections.filter((s) => s.isClassTeacher);
    const open = exams.find((e) => e.status === "MARKS_OPEN");

    return (
        <>
            <PageHead title={<Greeting name={user.name.split(" ")[0]} />} description={`${formatDate(TODAY, { weekday: "long", day: "numeric", month: "long" })} · ${user.title}${classTeacherOf.length ? ` · Class teacher of ${classTeacherOf.map((c) => c.label).join(", ")}` : ""}`} />

            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Card title="Today's classes" description="From your routine" padded={false}>
                    {today.length ? (
                        <ol className="divide-y divide-line">
                            {today.map((c) => {
                                const st = att.sections.find((s) => s.sectionId === c.sectionId);
                                return (
                                    <li key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                                        <span className="w-16 shrink-0 text-[13px] text-ink-soft tabular-nums">
                                            {c.period.start}
                                            <br />
                                            {c.period.end}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-semibold text-ink">{c.subject}</span>
                                            <span className="block text-[13.5px] text-ink-soft">
                                                Period {c.period.number} · {c.section}
                                            </span>
                                        </span>
                                        {st?.taken ? (
                                            <Badge tone="green">Attendance done</Badge>
                                        ) : (
                                            <Link href={`/admin/attendance?section=${c.sectionId}`} className="btn-primary min-h-9 px-3.5 text-[13.5px]">
                                                Take
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <p className="px-5 py-10 text-center text-ink-soft">No classes today. Enjoy the day!</p>
                    )}
                </Card>

                <div className="grid content-start gap-4">
                    <Card title="My classes today" padded={false}>
                        <ul className="divide-y divide-line">
                            {mySections.map((s) => (
                                <li key={s.sectionId} className="px-5 py-3">
                                    <div className="mb-1.5 flex justify-between text-[14px]">
                                        <span className="font-medium text-ink">{s.section}</span>
                                        {s.taken ? <span className="text-ink-soft">{s.absent} absent</span> : <Badge tone="yellow">Not taken</Badge>}
                                    </div>
                                    {s.taken && <Progress value={Math.round(((s.present + s.late) / s.total) * 100)} label={`${s.section} attendance`} />}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    {open && (
                        <Card title={`${open.name}: marks entry open`}>
                            <p className="text-[14px] text-ink-soft">Enter marks for your subjects before the deadline. Marks lock when the principal publishes.</p>
                            <Link href="/admin/exams/marks" className="btn-primary mt-4 min-h-10 text-[14px]">
                                Enter marks
                            </Link>
                        </Card>
                    )}
                </div>
            </div>

            <Card title="Staff notices" className="mt-4" padded={false}>
                <ul className="divide-y divide-line">
                    {notices.map((n) => (
                        <li key={n.id} className="px-5 py-3.5">
                            <p className="font-medium text-ink">{n.title}</p>
                            <p className="mt-0.5 text-[13.5px] text-ink-soft">{n.body}</p>
                        </li>
                    ))}
                </ul>
            </Card>
        </>
    );
}
