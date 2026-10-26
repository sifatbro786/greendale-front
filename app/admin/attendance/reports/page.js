import AttendanceReport from "@/components/dash/AttendanceReport";
import { BarChart } from "@/components/dash/charts";
import { Badge, Card, PageHead, Progress, StatCard } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { attendanceSummary, attendanceTrend, monthlyReport, TODAY } from "@/lib/dashboard/attendance";
import { monthLabel } from "@/lib/dashboard/fees";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Attendance reports" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function AttendanceReportsPage() {
    await requirePermission("attendance.view");
    const [summary, trend, sections] = await Promise.all([attendanceSummary(), attendanceTrend(10), listSectionOptions()]);
    const month = TODAY.slice(0, 7);
    const reports = {};
    for (const s of sections) reports[s.value] = await monthlyReport(s.value, month);
    const totals = summary.sections.reduce((a, s) => ({ absent: a.absent + s.absent, late: a.late + s.late }), { absent: 0, late: 0 });

    return (
        <>
            <PageHead title="Attendance reports" description="Holidays and weekends are excluded automatically." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Attendance", href: "/admin/attendance" }, { label: "Reports" }]} />
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label={`Today, ${formatDate(TODAY, { day: "numeric", month: "short" })}`} value={summary.rate == null ? "—" : `${summary.rate}%`} hint="Present + late" icon="CalendarCheck" />
                <StatCard label="Absent today" value={totals.absent} hint="Guardians get one SMS after 10:30" icon="CircleAlert" tone="coral" />
                <StatCard label="Late today" value={totals.late} icon="Clock" tone="sun" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
                <Card title="Today by class" padded={false}>
                    <ul className="divide-y divide-line">
                        {summary.sections.map((s) => (
                            <li key={s.sectionId} className="px-5 py-3">
                                <div className="mb-1.5 flex justify-between text-[14px]">
                                    <span className="font-medium">{s.section}</span>
                                    {s.taken ? (
                                        <span className="text-ink-soft">
                                            {s.present + s.late}/{s.total} · {s.absent} absent
                                        </span>
                                    ) : (
                                        <Badge tone="yellow">Not taken</Badge>
                                    )}
                                </div>
                                {s.taken && <Progress value={Math.round(((s.present + s.late) / s.total) * 100)} label={s.section} />}
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Last 10 school days">
                    <BarChart data={trend.map((t) => ({ label: formatDate(t.date, { day: "numeric", month: "short" }).replace(" ", " "), value: t.rate }))} unit="%" width={560} height={260} ariaLabel="Attendance rate, last 10 school days" />
                </Card>
            </div>
            <Card className="mt-4" padded={false}>
                <AttendanceReport sections={sections.map(({ value, label }) => ({ value, label }))} reports={reports} monthLabel={monthLabel(month)} />
            </Card>
        </>
    );
}
