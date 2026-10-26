import RoutineGrid from "@/components/dash/RoutineGrid";
import { Card, PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { getRoutine } from "@/lib/dashboard/routine";
import { getStudent } from "@/lib/dashboard/students";

export const metadata = { title: "Routine" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalRoutine() {
    const user = await requireStudent();
    const s = await getStudent(user.studentId);
    const routine = await getRoutine({ sectionId: s.sectionId });
    return (
        <>
            <PageHead title="Class routine" description={`${s.section} · Sunday to Thursday`} />
            <Card padded={false}>
                <RoutineGrid options={[{ value: s.sectionId, label: s.section }]} routines={{ [s.sectionId]: routine }} />
            </Card>
        </>
    );
}
