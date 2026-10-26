import { notFound } from "next/navigation";

import PrintButton from "@/components/dash/PrintButton";
import Receipt from "@/components/dash/Receipt";
import { PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { getReceipt } from "@/lib/dashboard/fees";

export const metadata = { title: "Receipt" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalReceipt({ params }) {
    const user = await requireStudent();
    const { paymentId } = await params;
    const data = await getReceipt(paymentId);
    // Another student's receipt → 404, so ids cannot be probed (PRD §5).
    if (!data || data.payment.studentId !== user.studentId) notFound();
    return (
        <>
            <div className="print:hidden">
                <PageHead title={`Receipt ${data.payment.receiptNo}`} crumbs={[{ label: "Fees", href: "/portal/fees" }, { label: data.payment.receiptNo }]} actions={<PrintButton label="Print / Save PDF" />} />
            </div>
            <Receipt data={data} />
        </>
    );
}
