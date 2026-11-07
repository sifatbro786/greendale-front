import PayOnline from "@/components/dash/PayOnline";
import { InvoiceTable, PaymentList } from "@/components/dash/StudentBlocks";
import { Card, PageHead, StatCard } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { studentLedger } from "@/lib/dashboard/fees";
import { formatMoney } from "@/lib/format";
import { isDemo } from "@/lib/mode";

const RETURN = {
    success: ["brand", "Payment received. Your receipt is below."],
    processing: ["sky", "Payment is being confirmed by the gateway. Refresh in a minute to see the receipt."],
    failed: ["coral", "The payment did not go through. No money was taken by the school; try again or pay at the office."],
    cancelled: ["sun", "Payment cancelled."],
};

export const metadata = { title: "Fees & payments" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalFees({ searchParams }) {
    const user = await requireStudent();
    const { payment } = await searchParams;
    const l = await studentLedger(user.studentId);
    const back = RETURN[payment];
    return (
        <>
            <PageHead title="Fees & payments" description="Your invoices, payments and receipts." actions={<PayOnline due={l.totals.due} demo={isDemo} />} />
            {back && <p className={`mb-4 rounded-2xl border px-4 py-3 text-[14.5px] font-medium ${{ brand: "border-brand/30 bg-brand-soft text-brand-deep", sky: "border-sky/30 bg-sky-soft text-[#1d6f9c]", coral: "border-coral/30 bg-coral-soft text-[#b4432a]", sun: "border-sun/50 bg-sun-soft text-[#7a5d00]" }[back[0]]}`} role="status">{back[1]}</p>}
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
