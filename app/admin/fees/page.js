import { HandCoins, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { BarChart, ShareBars } from "@/components/dash/charts";
import DataTable from "@/components/dash/DataTable";
import DemoButton from "@/components/dash/DemoButton";
import FeeSetup from "@/components/dash/fees/FeeSetup";
import { Card, PageHead, StatCard } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions, listSessions } from "@/lib/dashboard/academics";
import { dueList, feeStructure, feeSummary } from "@/lib/dashboard/fees";
import { formatMoney } from "@/lib/format";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Fees" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function FeesPage() {
    const user = await requirePermission("fees.view");
    const [sum, dues, structure, sections, sessions] = await Promise.all([feeSummary(), dueList(), feeStructure(), listSectionOptions(), listSessions()]);
    const current = sessions.find((x) => x.isCurrent) ?? sessions[0];
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date()).slice(0, 7);
    const tuitionRow = structure.find((c) => c.className === "Class I") ?? structure[0];
    const tuition = tuitionRow?.heads.find((h) => h.type === "MONTHLY")?.amount ?? 0;
    const classes = [...new Map(sections.map((s) => [s.classId, s.label.replace(" (A)", "")])).entries()].map(([value, label]) => ({ value, label }));

    return (
        <>
            <PageHead
                title="Fees & accounts"
                description="Money is stored in whole taka. Payments are never deleted, only reversed with a reason."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Fees" }]}
                actions={
                    <>
                        {(can(user, "sms.send") || can(user, "sms.dues")) && !isDemo ? (
                            <Link href="/admin/sms" className="btn-ghost min-h-10 text-[14px]">
                                <MessageSquareText className="size-4" aria-hidden="true" /> Send due reminders
                            </Link>
                        ) : can(user, "sms.send") || can(user, "sms.dues") ? (
                            <DemoButton className="btn-ghost min-h-10 text-[14px]" title={`Due reminders to ${dues.length} guardians`} message="Demo: one SMS per guardian with the exact due amount, sent through the SMS queue.">
                                <MessageSquareText className="size-4" aria-hidden="true" /> Send due reminders
                            </DemoButton>
                        ) : null}
                        {can(user, "fees.collect") && (
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
                <StatCard label={`Monthly tuition (${tuitionRow?.className ?? "—"})`} value={formatMoney(tuition)} hint="See fee structure below" icon="ReceiptText" tone="sun" />
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
            <FeeSetup structure={structure} canManage={can(user, "fees.manage")} month={month} sessionName={current?.name ?? ""} demo={isDemo} />
        </>
    );
}
