import { notFound } from "next/navigation";

import ExamSetup from "@/components/dash/exams/ExamSetup";
import { Badge, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { getExam } from "@/lib/dashboard/exams";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Exam setup" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

const LABEL = { DRAFT: "Draft", MARKS_OPEN: "Marks open", LOCKED: "Locked", PUBLISHED: "Published" };

export default async function ExamSetupPage({ params }) {
    await requirePermission("exams.manage");
    const { id } = await params;
    const exam = await getExam(id);
    if (!exam) notFound();
    return (
        <>
            <PageHead
                title={exam.name}
                description="Full and pass marks per subject, and the exam schedule shown on admit cards and in the portal."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Exams", href: "/admin/exams" }, { label: exam.name }]}
                actions={<Badge tone={exam.status === "PUBLISHED" ? "green" : exam.status === "MARKS_OPEN" ? "blue" : "yellow"}>{LABEL[exam.status]}</Badge>}
            />
            <ExamSetup exam={exam} demo={isDemo} />
        </>
    );
}
