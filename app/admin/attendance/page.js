import Link from "next/link";

import AttendanceTaker from "@/components/dash/AttendanceTaker";
import { PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { listSectionOptions, teacherSections } from "@/lib/dashboard/academics";
import { getAttendanceSheet, recentSchoolDays, today as todayFn } from "@/lib/dashboard/attendance";
import { isDemo } from "@/lib/mode";
import { redirect } from "next/navigation";

export const metadata = { title: "Attendance" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function AttendancePage() {
    const user = await requireStaff();
    if (!can(user, "attendance.take")) {
        if (can(user, "attendance.view")) redirect("/admin/attendance/reports");
        redirect("/admin");
    }
    const sections = user.role === "TEACHER" ? await teacherSections(user.staffId) : await listSectionOptions();
    const today = todayFn();
    const dates = (await recentSchoolDays(6)).reverse();
    if (!dates.includes(today)) dates.unshift(today); // weekends / holidays show a friendly "closed" note
    const opts = sections.map(({ value, label }) => ({ value, label }));
    // Demo: every sheet up front (cheap, static). Live: only the first sheet; the rest load on demand.
    const sheets = {};
    if (isDemo) for (const s of opts) for (const d of dates) sheets[`${s.value}|${d}`] = await getAttendanceSheet(s.value, d);
    const initial = !isDemo && opts[0] ? await getAttendanceSheet(opts[0].value, today) : null;

    return (
        <>
            <PageHead
                title="Take attendance"
                description="Takes under a minute: everyone starts present, tap only who is absent or late."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Attendance" }]}
                actions={
                    can(user, "attendance.view") && (
                        <Link href="/admin/attendance/reports" className="btn-ghost min-h-10 text-[14px]">
                            Reports
                        </Link>
                    )
                }
            />
            <AttendanceTaker sections={opts} dates={dates} sheets={sheets} initial={initial} today={today} cutoff={initial?.smsCutoff ?? "10:30"} demo={isDemo} />
        </>
    );
}
