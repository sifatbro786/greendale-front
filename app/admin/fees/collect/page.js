import FeeCollector from "@/components/dash/FeeCollector";
import { PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { collectList } from "@/lib/dashboard/fees";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Collect fee" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function CollectPage() {
    const user = await requirePermission("fees.collect");
    const students = await collectList();
    return (
        <>
            <PageHead title="Collect fee" description="Find the student, tick the dues being paid, print the receipt." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Fees", href: "/admin/fees" }, { label: "Collect" }]} />
            <FeeCollector students={students} collector={user.name} demo={isDemo} />
        </>
    );
}
