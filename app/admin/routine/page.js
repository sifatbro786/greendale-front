import RoutineGrid from "@/components/dash/RoutineGrid";
import { Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions, listStaff } from "@/lib/dashboard/academics";
import { getRoutine } from "@/lib/dashboard/routine";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Routine" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function RoutinePage() {
    const user = await requirePermission("routine.view");
    const teacher = user.role === "TEACHER";
    let options;
    if (teacher) options = user.staffId ? [{ value: `t:${user.staffId}`, label: "My routine" }] : [];
    else {
        // Staff list needs academics.manage; without it only class routines are offered.
        const [sections, staff] = await Promise.all([listSectionOptions(), can(user, "academics.manage") ? listStaff() : []]);
        options = [...sections.map(({ value, label }) => ({ value, label })), ...staff.map((t) => ({ value: `t:${t.id}`, label: `Teacher · ${t.name}` }))];
    }
    const load = (v) => (v.startsWith("t:") ? getRoutine({ staffId: v.slice(2) }) : getRoutine({ sectionId: v }));
    // Demo: all routines up front (static). Live: the first one; the grid loads the rest on demand.
    const routines = {};
    if (isDemo) for (const o of options) routines[o.value] = await load(o.value);
    const initial = !isDemo && options[0] ? await load(options[0].value) : null;

    return (
        <>
            <PageHead
                title={teacher ? "My routine" : "Class routine"}
                description={teacher ? "Your weekly classes, built automatically from the class routines." : "Class routines; teacher routines are generated from them."}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Routine" }]}
            />
            <Card padded={false}>
                {options.length ? (
                    <RoutineGrid options={options} routines={routines} initial={initial} showTeacher={!teacher} canEdit={!teacher && can(user, "routine.manage")} demo={isDemo} />
                ) : (
                    <p className="p-6 text-ink-soft">Your login is not linked to a staff record yet, so there is no routine to show.</p>
                )}
            </Card>
        </>
    );
}
