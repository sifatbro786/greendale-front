import Link from "next/link";

import { formatDate, formatMoney } from "@/lib/format";

import { Badge } from "./ui";

const STATUS_STYLE = {
    PRESENT: "bg-brand text-white",
    LATE: "bg-sun text-ink",
    ABSENT: "bg-coral text-white",
};

/** Month calendar of attendance (shared by admin profile and guardian portal). */
export function AttendanceCalendar({ data }) {
    const first = new Date(`${data.month}-01T00:00:00Z`).getUTCDay(); // 0 = Sunday
    const blanks = Array.from({ length: first });
    return (
        <div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[12px] font-semibold tracking-wide text-ink-soft uppercase">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1">
                        {d}
                    </div>
                ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1.5">
                {blanks.map((_, i) => (
                    <div key={`b${i}`} />
                ))}
                {data.days.map((d) => {
                    const n = Number(d.date.slice(8));
                    const cls = d.status ? STATUS_STYLE[d.status] : d.holiday ? "bg-sky-soft text-sky" : !d.schoolDay ? "bg-ink/[0.04] text-ink-soft/60" : d.future ? "border border-dashed border-line text-ink-soft" : "bg-paper text-ink-soft";
                    return (
                        <div key={d.date} title={d.holiday ?? d.status ?? (d.schoolDay ? "" : "Weekend")} className={`grid aspect-square place-items-center rounded-xl text-[14px] font-medium tabular-nums ${cls}`}>
                            {n}
                        </div>
                    );
                })}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-soft">
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-brand" /> Present ({data.present})</li>
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-sun" /> Late ({data.late})</li>
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-coral" /> Absent ({data.absent})</li>
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-sky-soft ring-1 ring-sky/30" /> Holiday</li>
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-ink/[0.06]" /> Weekend</li>
            </ul>
        </div>
    );
}

/** Published results summary table. */
export function ResultsTable({ results, hrefFor }) {
    if (!results.length) return <p className="py-6 text-center text-ink-soft">No published results yet.</p>;
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[14px]">
                <thead>
                    <tr className="border-b border-line text-[12.5px] tracking-wide text-ink-soft uppercase">
                        <th className="py-2.5 pr-4 font-semibold">Exam</th>
                        <th className="py-2.5 pr-4 text-right font-semibold">Total</th>
                        <th className="py-2.5 pr-4 text-right font-semibold">GPA</th>
                        <th className="py-2.5 pr-4 font-semibold">Grade</th>
                        <th className="py-2.5 pr-4 text-right font-semibold">Position</th>
                        <th className="py-2.5" />
                    </tr>
                </thead>
                <tbody>
                    {results.map((r) => (
                        <tr key={r.exam.id} className="border-b border-line last:border-0">
                            <td className="py-3 pr-4">
                                <span className="font-medium text-ink">{r.exam.name}</span>
                                <span className="block text-[12.5px] text-ink-soft">Published {formatDate(r.exam.publishedAt)}</span>
                            </td>
                            <td className="py-3 pr-4 text-right tabular-nums">
                                {r.total}/{r.fullTotal}
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold tabular-nums">{r.gpa.toFixed(2)}</td>
                            <td className="py-3 pr-4">
                                <Badge tone={r.failed ? "red" : r.grade === "A+" ? "green" : "blue"}>{r.grade}</Badge>
                            </td>
                            <td className="py-3 pr-4 text-right tabular-nums">
                                {r.position} of {r.outOf}
                            </td>
                            <td className="py-3 text-right">
                                {hrefFor && (
                                    <Link href={hrefFor(r.exam.id)} className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">
                                        Marksheet →
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Invoice list with paid/due state. */
export function InvoiceTable({ invoices }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead>
                    <tr className="border-b border-line text-[12.5px] tracking-wide text-ink-soft uppercase">
                        <th className="py-2.5 pr-4 font-semibold">Fee</th>
                        <th className="py-2.5 pr-4 font-semibold">Period</th>
                        <th className="py-2.5 pr-4 text-right font-semibold">Amount</th>
                        <th className="py-2.5 pr-4 text-right font-semibold">Waiver</th>
                        <th className="py-2.5 pr-4 text-right font-semibold">Due</th>
                        <th className="py-2.5 font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {[...invoices].reverse().map((i) => (
                        <tr key={i.id} className="border-b border-line last:border-0">
                            <td className="py-2.5 pr-4 font-medium text-ink">{i.head}</td>
                            <td className="py-2.5 pr-4 text-ink-soft">{i.period}</td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">{formatMoney(i.amount)}</td>
                            <td className="py-2.5 pr-4 text-right text-ink-soft tabular-nums">{i.discount ? `− ${formatMoney(i.discount)}` : "—"}</td>
                            <td className={`py-2.5 pr-4 text-right font-semibold tabular-nums ${i.due ? "text-coral" : "text-ink"}`}>{formatMoney(i.due)}</td>
                            <td className="py-2.5">
                                <Badge tone={i.status === "PAID" ? "green" : i.status === "PARTIAL" ? "yellow" : "red"}>{i.status === "PAID" ? "Paid" : i.status === "PARTIAL" ? "Partly paid" : "Due"}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Payment history with receipt links. */
export function PaymentList({ payments, receiptHref }) {
    if (!payments.length) return <p className="py-6 text-center text-ink-soft">No payments yet.</p>;
    return (
        <ul className="divide-y divide-line">
            {payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">
                            {p.receiptNo} {p.status === "REVERSED" && <Badge tone="red">Reversed</Badge>}
                        </span>
                        <span className="block text-[12.5px] text-ink-soft">
                            {formatDate(p.paidAt)} · {p.method === "BKASH" ? "bKash" : p.method === "CARD" ? "Card" : "Cash"} · {p.heads.join(", ")}
                        </span>
                    </span>
                    <span className="font-semibold text-ink tabular-nums">{formatMoney(p.amount)}</span>
                    {receiptHref && (
                        <Link href={receiptHref(p.id)} className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">
                            Receipt
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );
}
