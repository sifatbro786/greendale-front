import CardsGenerator from "@/components/dash/CardsGenerator";
import { PageHead } from "@/components/dash/ui";
import { school } from "@/config/school";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { db } from "@/lib/dashboard/_shared";
import { listExams } from "@/lib/dashboard/exams";
import { listStudents } from "@/lib/dashboard/students";

export const metadata = { title: "Admit & ID cards" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function CardsPage() {
    await requirePermission("cards.generate");
    const [sections, exams, students] = await Promise.all([listSectionOptions(), listExams(), listStudents()]);
    const blood = new Map(db.students.map((s) => [s.id, s.bloodGroup]));
    return (
        <>
            <PageHead title="Admit & ID cards" description="Generate a whole class in one click. Missing photos show a placeholder." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Admit & ID cards" }]} />
            <CardsGenerator
                sections={sections.map(({ value, label }) => ({ value, label }))}
                exams={exams.filter((e) => e.status !== "PUBLISHED").concat(exams.filter((e) => e.status === "PUBLISHED")).map(({ id, name }) => ({ id, name }))}
                students={students.filter((s) => s.status === "ACTIVE").map((s) => ({ id: s.id, name: s.name, section: s.section, sectionId: s.sectionId, roll: s.roll, studentUid: s.studentUid, due: s.due, guardianPhone: s.guardianPhone, bloodGroup: blood.get(s.id) }))}
                school={{ crest: school.logo.crest, w: school.logo.width, h: school.logo.height, address: school.contact.addressShort, eiin: school.eiin }}
            />
        </>
    );
}
