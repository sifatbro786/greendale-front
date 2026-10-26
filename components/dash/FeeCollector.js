"use client";

import { Printer, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import Modal from "./Modal";
import { useToast } from "./Toast";

const money = (n) => `৳ ${new Intl.NumberFormat("en-IN").format(n)}`;

/**
 * Counter fee collection (PRD §6.7). Select dues, take full or partial payment, print a numbered receipt.
 * Phase 2: POST /api/fees/payments { studentId, amount, method, allocations[] } → receiptNo from a locked
 * counter row inside the same transaction (gap-free, never duplicated).
 */
export default function FeeCollector({ students, nextReceiptNo, collector }) {
    const [q, setQ] = useState("");
    const [studentId, setStudentId] = useState(null);
    const [picked, setPicked] = useState({});
    const [method, setMethod] = useState("CASH");
    const [amount, setAmount] = useState("");
    const [receipt, setReceipt] = useState(null);
    const toast = useToast();

    const results = useMemo(() => {
        const n = q.trim().toLowerCase();
        if (!n) return students.filter((s) => s.due > 0).slice(0, 6);
        return students.filter((s) => s.name.toLowerCase().includes(n) || s.studentUid.toLowerCase().includes(n) || String(s.roll) === n).slice(0, 8);
    }, [q, students]);

    const s = students.find((x) => x.id === studentId);
    const selected = s ? s.dues.filter((d) => picked[d.id]) : [];
    const selectedTotal = selected.reduce((a, d) => a + d.due, 0);
    const pay = amount === "" ? selectedTotal : Math.max(0, Math.min(Number(amount) || 0, selectedTotal));

    function choose(id) {
        const st = students.find((x) => x.id === id);
        setStudentId(id);
        setPicked(Object.fromEntries(st.dues.map((d) => [d.id, true])));
        setAmount("");
    }

    function collect() {
        if (!pay) return toast("Select at least one due and enter an amount.", { tone: "error", title: "Nothing to collect" });
        // Allocate oldest dues first (partial payment leaves the remainder due).
        let left = pay;
        const lines = selected.map((d) => {
            const a = Math.min(left, d.due);
            left -= a;
            return { ...d, paid: a };
        }).filter((l) => l.paid > 0);
        setReceipt({ no: nextReceiptNo, at: new Date().toISOString(), lines, total: pay, method, student: s });
    }

    return (
        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
            <section className="rounded-2xl border border-line bg-white">
                <div className="border-b border-line p-4">
                    <label className="relative block">
                        <span className="sr-only">Find student</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, student ID or roll" className="h-11 w-full rounded-xl border border-line pr-3 pl-9 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
                    </label>
                    {!q && <p className="mt-2 text-[12.5px] text-ink-soft">Showing students with the highest dues</p>}
                </div>
                <ul className="divide-y divide-line">
                    {results.map((r) => (
                        <li key={r.id}>
                            <button type="button" onClick={() => choose(r.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper ${studentId === r.id ? "bg-brand-soft/60" : ""}`}>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium text-ink">{r.name}</span>
                                    <span className="block text-[12.5px] text-ink-soft">
                                        {r.studentUid} · {r.section} · Roll {r.roll}
                                    </span>
                                </span>
                                <span className={`text-[13.5px] font-semibold tabular-nums ${r.due ? "text-coral" : "text-brand"}`}>{r.due ? money(r.due) : "Clear"}</span>
                            </button>
                        </li>
                    ))}
                    {results.length === 0 && <li className="px-4 py-8 text-center text-ink-soft">No student found</li>}
                </ul>
            </section>

            <section className="rounded-2xl border border-line bg-white">
                {!s ? (
                    <p className="px-6 py-20 text-center text-ink-soft">Select a student to see their dues.</p>
                ) : (
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                            <div>
                                <p className="text-lg font-semibold text-ink">{s.name}</p>
                                <p className="text-[13.5px] text-ink-soft">
                                    {s.studentUid} · {s.section} · Roll {s.roll}
                                </p>
                            </div>
                            <Link href={`/admin/students/${s.id}`} className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">
                                Full ledger →
                            </Link>
                        </div>
                        {s.dues.length === 0 ? (
                            <p className="px-6 py-14 text-center text-ink-soft">No dues. All fees are paid.</p>
                        ) : (
                            <>
                                <ul className="divide-y divide-line">
                                    {s.dues.map((d) => (
                                        <li key={d.id}>
                                            <label className="flex cursor-pointer items-center gap-3 px-5 py-3">
                                                <input type="checkbox" checked={!!picked[d.id]} onChange={(e) => setPicked((p) => ({ ...p, [d.id]: e.target.checked }))} className="size-5 accent-[var(--brand)]" />
                                                <span className="flex-1">
                                                    <span className="block font-medium text-ink">{d.head}</span>
                                                    <span className="block text-[12.5px] text-ink-soft">{d.period}</span>
                                                </span>
                                                <span className="font-semibold tabular-nums">{money(d.due)}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                <div className="grid gap-3 border-t border-line bg-paper/50 p-5 sm:grid-cols-3">
                                    <label>
                                        <span className="text-[13px] font-medium text-ink-soft">Amount received</span>
                                        <input type="number" inputMode="numeric" value={amount} placeholder={String(selectedTotal)} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] tabular-nums" />
                                    </label>
                                    <label>
                                        <span className="text-[13px] font-medium text-ink-soft">Method</span>
                                        <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                                            <option value="CASH">Cash</option>
                                            <option value="BKASH">bKash (manual)</option>
                                            <option value="BANK">Bank deposit</option>
                                        </select>
                                    </label>
                                    <div className="flex flex-col justify-end">
                                        <button type="button" onClick={collect} className="btn-primary min-h-11">
                                            Collect {money(pay)}
                                        </button>
                                    </div>
                                    {pay < selectedTotal && pay > 0 && <p className="text-[13px] text-[#8a6a00] sm:col-span-3">Partial payment: {money(selectedTotal - pay)} will stay due, applied to the oldest months first.</p>}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </section>

            <Modal
                open={!!receipt}
                onClose={() => setReceipt(null)}
                title="Money receipt (preview)"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setReceipt(null)}>
                            Close
                        </button>
                        <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={() => window.print()}>
                            <Printer className="size-4" aria-hidden="true" /> Print
                        </button>
                    </>
                }
            >
                {receipt && (
                    <div className="text-[14px]">
                        <div className="flex justify-between">
                            <span className="font-semibold">Receipt {receipt.no}</span>
                            <span className="text-ink-soft">{new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(receipt.at))}</span>
                        </div>
                        <p className="mt-1 text-ink-soft">
                            {receipt.student.name} · {receipt.student.section} · Roll {receipt.student.roll}
                        </p>
                        <table className="mt-4 w-full">
                            <tbody>
                                {receipt.lines.map((l) => (
                                    <tr key={l.id} className="border-b border-line">
                                        <td className="py-2">
                                            {l.head} <span className="text-ink-soft">· {l.period}</span>
                                        </td>
                                        <td className="py-2 text-right tabular-nums">{money(l.paid)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="py-2 font-semibold">Total ({receipt.method === "CASH" ? "Cash" : receipt.method === "BKASH" ? "bKash" : "Bank"})</td>
                                    <td className="py-2 text-right font-semibold tabular-nums">{money(receipt.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="mt-3 text-[12.5px] text-ink-soft">Collected by {collector}. Demo: the receipt number is only reserved when the backend saves the payment.</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
