import { notFound } from "next/navigation";

import ReverseButton from "@/components/dash/fees/ReverseButton";
import PrintButton from "@/components/dash/PrintButton";
import Receipt from "@/components/dash/Receipt";
import { PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getReceipt } from "@/lib/dashboard/fees";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Receipt" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function ReceiptPage({ params }) {
    const user = await requirePermission("fees.view");
    const { id } = await params;
    const data = await getReceipt(id);
    if (!data) notFound();
    return (
        <>
            <div className="print:hidden">
                <PageHead
                    title={`Receipt ${data.payment.receiptNo}`}
                    crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Payments", href: "/admin/fees/payments" }, { label: data.payment.receiptNo }]}
                    actions={
                        <>
                            {can(user, "fees.manage") && data.payment.status === "VALID" && (
                                <ReverseButton paymentId={data.payment.id} receiptNo={data.payment.receiptNo} demo={isDemo} />
                            )}
                            <PrintButton />
                        </>
                    }
                />
            </div>
            <Receipt data={data} />
        </>
    );
}
