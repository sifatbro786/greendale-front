import { HandCoins, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { BarChart, ShareBars } from "@/components/dash/charts";
import DataTable from "@/components/dash/DataTable";
import DemoButton from "@/components/dash/DemoButton";
import { Card, PageHead, StatCard } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { dueList, feeStructure, feeSummary } from "@/lib/dashboard/fees";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Fees" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function FeesPage() {
    const user = await requirePermission("fees.view");
    const [sum, dues, structure, sections] = await Promise.all([feeSummary(), dueList(), feeStructure(), listSectionOptions()]);
    const classes = [...new Map(sections.map((s) => [s.classId, s.label.replace(" (A)", "")])).entries()].map(([value, label]) => ({ value, label }));
    const heads = structure[0].heads.map((h) => h.head);

    return (
        <>
            <PageHead
                title="Fees & accounts"
                description="Money is stored in whole taka. Payments are never deleted, only reversed with a reason."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Fees" }]}
                actions={
                    <>
                        {can(user.role, "sms.send") || can(user.role, "sms.dues") ? (
                            <DemoButton className="btn-ghost min-h-10 text-[14px]" title={`Due reminders to ${dues.length} guardians`} message="Demo: one SMS per guardian with the exact due amount, sent through the SMS queue.">
                                <MessageSquareText className="size-4" aria-hidden="true" /> Send due reminders
                            </DemoButton>
                        ) : null}
                        {can(user.role, "fees.collect") && (
                            <Link href="/admin/fees/collect" className="btn-primary min-h-10 text-[14px]">
                                <HandCoins className="size-4" aria-hidden="true" /> Collect fee
                            </Link>
                        )}
                    </>
                }
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Collected today" value={formatMoney(sum.today)} hint={`${sum.todayCount} receipts`} icon="Wallet" href="/admin/fees/payments" />
                <StatCard label="This month" value={formatMoney(sum.thisMonth)} icon="TrendingUp" tone="sky" />
                <StatCard label="Total dues" value={formatMoney(sum.totalDue)} hint={`${sum.defaulters} students`} icon="CircleAlert" tone="coral" />
                <StatCard label="Monthly tuition (Class I)" value={formatMoney(structure.find((c) => c.classId === "c1").heads.find((h) => h.type === "MONTHLY").amount)} hint="See fee structure below" icon="ReceiptText" tone="sun" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Card title="Collection by month">
                    <BarChart data={sum.byMonth} unit="৳" width={640} height={240} ariaLabel="Fee collection by month" />
                </Card>
                <Card title="This month by method" description="Online payments are confirmed only by the gateway IPN.">
                    <ShareBars data={sum.methods} unit="৳" />
                </Card>
            </div>
            <Card title="Due list" description="Students with unpaid invoices, highest first." className="mt-4" padded={false}>
                <DataTable
                    rows={dues.map((d) => ({ ...d, id: d.studentId }))}
                    columns={[
                        { key: "name", label: "Student", type: "person", sub: "studentUid", href: "/admin/students/{studentId}" },
                        { key: "section", label: "Class" },
                        { key: "roll", label: "Roll", type: "number" },
                        { key: "monthsDue", label: "Months due", type: "number" },
                        { key: "guardianPhone", label: "Guardian", hideOnMobile: true },
                        { key: "due", label: "Due", type: "money" },
                    ]}
                    searchKeys={["name", "studentUid", "guardianPhone"]}
                    filters={[{ key: "classId", label: "Class", options: classes }]}
                    exportName="greendale-due-list"
                    initialSort={{ key: "due", dir: "desc" }}
                />
            </Card>
            <Card title="Fee structure · session 2026" className="mt-4" padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-line bg-paper/60 text-[12.5px] tracking-wide text-ink-soft uppercase">
                                <th className="px-5 py-2.5 font-semibold">Class</th>
                                {heads.map((h) => (
                                    <th key={h} className="px-5 py-2.5 text-right font-semibold">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {structure.map((c) => (
                                <tr key={c.classId} className="border-b border-line last:border-0">
                                    <td className="px-5 py-2.5 font-medium">{c.className}</td>
                                    {c.heads.map((h) => (
                                        <td key={h.head} className="px-5 py-2.5 text-right tabular-nums">
                                            {formatMoney(h.amount)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="border-t border-line px-5 py-3 text-[13px] text-ink-soft">Sample amounts for the demo. Sibling waivers and scholarships are separate discount lines, never edits to the invoice.</p>
            </Card>
        </>
    );
}
