import { ResultsTable } from "@/components/dash/StudentBlocks";
import { Card, PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { studentResults } from "@/lib/dashboard/exams";

export const metadata = { title: "Results" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalResults() {
    const user = await requireStudent();
    const results = await studentResults(user.studentId);
    return (
        <>
            <PageHead title="Results" description="Only published results appear here. Open a marksheet to print or save it as PDF." />
            <Card>
                <ResultsTable results={results} hrefFor={(id) => `/portal/results/${id}`} />
            </Card>
        </>
    );
}
