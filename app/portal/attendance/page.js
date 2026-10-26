import MonthSwitcher from "@/components/dash/MonthSwitcher";
import { AttendanceCalendar } from "@/components/dash/StudentBlocks";
import { Card, PageHead, StatCard } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { studentAttendanceMonth, TODAY } from "@/lib/dashboard/attendance";
import { monthLabel } from "@/lib/dashboard/fees";
import { getStudent } from "@/lib/dashboard/students";

export const metadata = { title: "Attendance" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalAttendance() {
    const user = await requireStudent();
    const s = await getStudent(user.studentId);
    const cur = Number(TODAY.slice(5, 7));
    const months = Array.from({ length: cur }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);
    const panels = {};
    for (const m of months) panels[m] = <AttendanceCalendar data={await studentAttendanceMonth(s.id, m)} />;
    return (
        <>
            <PageHead title="Attendance" description="If your child is marked absent, you get one SMS after 10:30 AM." />
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <Card>
                    <MonthSwitcher months={months.map((m) => ({ value: m, label: monthLabel(m) }))} panels={panels} />
                </Card>
                <div className="grid content-start gap-4">
                    <StatCard label="This session" value={`${s.attendance.rate}%`} hint="Present + late" icon="CalendarCheck" />
                    <StatCard label="Days absent" value={s.attendance.absent} icon="CircleAlert" tone="coral" />
                    <StatCard label="Days late" value={s.attendance.late} icon="Clock" tone="sun" />
                </div>
            </div>
        </>
    );
}
