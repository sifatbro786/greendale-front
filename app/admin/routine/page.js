import RoutineGrid from "@/components/dash/RoutineGrid";
import DemoButton from "@/components/dash/DemoButton";
import { Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { db } from "@/lib/dashboard/_shared";
import { getRoutine } from "@/lib/dashboard/routine";

export const metadata = { title: "Routine" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function RoutinePage() {
    const user = await requirePermission("routine.view");
    const teacher = user.role === "TEACHER";
    let options, routines;
    if (teacher) {
        options = [{ value: user.staffId, label: "My routine" }];
        routines = { [user.staffId]: await getRoutine({ staffId: user.staffId }) };
    } else {
        const sections = await listSectionOptions();
        options = [...sections.map(({ value, label }) => ({ value, label })), ...db.staff.map((t) => ({ value: `t:${t.id}`, label: `Teacher · ${t.name}` }))];
        routines = {};
        for (const s of sections) routines[s.value] = await getRoutine({ sectionId: s.value });
        for (const t of db.staff) routines[`t:${t.id}`] = await getRoutine({ staffId: t.id });
    }
    return (
        <>
            <PageHead
                title={teacher ? "My routine" : "Class routine"}
                description={teacher ? "Your weekly classes, built automatically from the class routines." : "Class routines; teacher routines are generated from them."}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Routine" }]}
                actions={can(user.role, "routine.manage") && <DemoButton className="btn-primary min-h-10 text-[14px]">Edit routine</DemoButton>}
            />
            <Card padded={false}>
                <RoutineGrid options={options} routines={routines} showTeacher={!teacher} />
            </Card>
        </>
    );
}
