import DataTable from "@/components/dash/DataTable";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { listPayments } from "@/lib/dashboard/fees";

export const metadata = { title: "Payments" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PaymentsPage() {
    await requirePermission("fees.view");
    const rows = (await listPayments()).map((p) => ({ ...p, methodLabel: p.method === "BKASH" ? "bKash" : p.method === "CARD" ? "Card" : "Cash" }));
    return (
        <>
            <PageHead title="Payments" description="Latest 400 receipts. Gap-free receipt numbers per year." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Fees", href: "/admin/fees" }, { label: "Payments" }]} />
            <Card padded={false}>
                <DataTable
                    rows={rows}
                    columns={[
                        { key: "receiptNo", label: "Receipt", href: "/admin/fees/payments/{id}" },
                        { key: "paidAt", label: "Date", type: "datetime" },
                        { key: "name", label: "Student", sub: "section" },
                        { key: "methodLabel", label: "Method" },
                        { key: "tranId", label: "Transaction ID", hideOnMobile: true },
                        { key: "amount", label: "Amount", type: "money" },
                        { key: "status", label: "Status", type: "badge" },
                    ]}
                    searchKeys={["receiptNo", "name", "tranId"]}
                    searchPlaceholder="Receipt, student or transaction"
                    filters={[
                        { key: "methodLabel", label: "Method", options: ["Cash", "bKash", "Card"].map((m) => ({ value: m, label: m })) },
                        { key: "status", label: "Status", options: [{ value: "VALID", label: "Valid" }, { value: "REVERSED", label: "Reversed" }] },
                    ]}
                    exportName="greendale-payments"
                    pageSize={25}
                />
            </Card>
        </>
    );
}
