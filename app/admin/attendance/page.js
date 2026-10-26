import Link from "next/link";

import AttendanceTaker from "@/components/dash/AttendanceTaker";
import { PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { listSectionOptions, teacherSections } from "@/lib/dashboard/academics";
import { getAttendanceSheet, TODAY } from "@/lib/dashboard/attendance";
import { lastSchoolDays } from "@/lib/dashboard/_shared";
import { redirect } from "next/navigation";

export const metadata = { title: "Attendance" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function AttendancePage() {
    const user = await requireStaff();
    if (!can(user.role, "attendance.take")) {
        if (can(user.role, "attendance.view")) redirect("/admin/attendance/reports");
        redirect("/admin");
    }
    const sections = user.role === "TEACHER" ? await teacherSections(user.staffId) : await listSectionOptions();
    const dates = lastSchoolDays(6).reverse();
    const sheets = {};
    for (const s of sections) for (const d of dates) sheets[`${s.value}|${d}`] = await getAttendanceSheet(s.value, d);

    return (
        <>
            <PageHead
                title="Take attendance"
                description="Takes under a minute: everyone starts present, tap only who is absent or late."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Attendance" }]}
                actions={
                    can(user.role, "attendance.view") && (
                        <Link href="/admin/attendance/reports" className="btn-ghost min-h-10 text-[14px]">
                            Reports
                        </Link>
                    )
                }
            />
            <AttendanceTaker sections={sections.map(({ value, label }) => ({ value, label }))} dates={dates} sheets={sheets} today={TODAY} cutoff="10:30" />
        </>
    );
}
