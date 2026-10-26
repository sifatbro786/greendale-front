import { notFound } from "next/navigation";

import DemoButton from "@/components/dash/DemoButton";
import PrintButton from "@/components/dash/PrintButton";
import Receipt from "@/components/dash/Receipt";
import { PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getReceipt } from "@/lib/dashboard/fees";

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
                            {can(user.role, "fees.manage") && data.payment.status === "VALID" && (
                                <DemoButton className="btn-ghost min-h-10 text-[14px]" title="Reverse payment" message="Demo: a reversal entry with a reason would be created and logged. The original receipt is kept.">
                                    Reverse
                                </DemoButton>
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
