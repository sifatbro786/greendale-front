import PayOnline from "@/components/dash/PayOnline";
import { InvoiceTable, PaymentList } from "@/components/dash/StudentBlocks";
import { Card, PageHead, StatCard } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { studentLedger } from "@/lib/dashboard/fees";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Fees & payments" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalFees() {
    const user = await requireStudent();
    const l = await studentLedger(user.studentId);
    return (
        <>
            <PageHead title="Fees & payments" description="Your invoices, payments and receipts for session 2026." actions={<PayOnline due={l.totals.due} />} />
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Due now" value={formatMoney(l.totals.due)} icon="CircleAlert" tone={l.totals.due ? "coral" : "brand"} />
                <StatCard label="Paid this session" value={formatMoney(l.totals.paid)} icon="Wallet" />
                <StatCard label="Waivers" value={formatMoney(l.totals.discount)} hint={l.totals.discount ? "Sibling discount" : "None"} icon="ReceiptText" tone="sun" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card title="Invoices">
                    <InvoiceTable invoices={l.invoices} />
                </Card>
                <Card title="Payments & receipts">
                    <PaymentList payments={l.payments} receiptHref={(id) => `/portal/fees/${id}`} />
                </Card>
            </div>
        </>
    );
}
