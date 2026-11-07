"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { label } from "../admin/fields";
import { useApiAction } from "../academics/useApiAction";
import { DEMO_SAVED, useToast } from "../Toast";
import { Card } from "../ui";

const money = (n) => new Intl.NumberFormat("en-IN").format(n);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Fee structure (editable with fees.manage: PUT /api/fees/structure) and monthly invoice generation
 * (POST /api/fees/invoices/generate, idempotent: existing invoices are skipped).
 * @param {{ structure: { classId: string, className: string, heads: { feeHeadId: string, head: string, type: string, amount: number }[] }[], canManage: boolean, month: string, sessionName: string, demo?: boolean }} props
 */
export default function FeeSetup({ structure, canManage, month, sessionName, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const router = useRouter();
    const toast = useToast();
    const [generating, setGenerating] = useState(false);
    const [edit, setEdit] = useState(false);
    const [values, setValues] = useState({});
    const [genMonth, setGenMonth] = useState(month);
    const [oneTime, setOneTime] = useState([]);
    const heads = structure[0]?.heads ?? [];
    const key = (c, h) => `${c}|${h}`;
    const changed = Object.entries(values).filter(([k, v]) => {
        const [c, h] = k.split("|");
        const old = structure.find((x) => x.classId === c)?.heads.find((x) => x.feeHeadId === h)?.amount ?? 0;
        return v !== "" && Number(v) !== old;
    });
    const bad = changed.some(([, v]) => !Number.isInteger(Number(v)) || Number(v) < 0);

    async function save() {
        const items = changed.map(([k, v]) => {
            const [classId, feeHeadId] = k.split("|");
            return { classId, feeHeadId, amount: Number(v) };
        });
        const r = await run("/api/fees/structure", "PUT", { items }, { success: `${items.length} fee amount${items.length > 1 ? "s" : ""} saved. New invoices use them; existing invoices keep their amount.` });
        if (r || demo) {
            setValues({});
            setEdit(false);
        }
    }

    async function generate() {
        if (demo) return toast(DEMO_SAVED, { title: "Invoices would be generated", tone: "info" });
        const monthly = heads.filter((h) => h.type === "MONTHLY").map((h) => h.feeHeadId);
        setGenerating(true);
        const r = await api("/api/fees/invoices/generate", { method: "POST", body: { month: genMonth, ...(oneTime.length && { feeHeadIds: [...monthly, ...oneTime] }) } });
        setGenerating(false);
        if (!r.ok) return toast(r.error.message, { title: "Not generated", tone: "error" });
        toast(r.data.created ? `${r.data.created} new invoices.${r.data.skipped ? ` ${r.data.skipped} already existed.` : ""}` : "Every student already has these invoices.", { title: "Invoices ready" });
        setOneTime([]);
        router.refresh();
    }

    return (
        <>
            {canManage && (
                <Card title="Generate invoices" description="Creates this month's tuition for every active student. Safe to run again: students who already have the invoice are skipped. Sibling waivers are applied automatically." className="mt-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <label>
                            <span className={label}>Month</span>
                            <input type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="mt-1 h-11 rounded-xl border border-line bg-white px-3 text-[15px]" />
                        </label>
                        <fieldset className="flex flex-wrap gap-2">
                            <legend className="sr-only">Also add one-time fees</legend>
                            {heads
                                .filter((h) => h.type !== "MONTHLY")
                                .map((h) => {
                                    const on = oneTime.includes(h.feeHeadId);
                                    return (
                                        <button
                                            key={h.feeHeadId}
                                            type="button"
                                            aria-pressed={on}
                                            onClick={() => setOneTime((x) => (on ? x.filter((y) => y !== h.feeHeadId) : [...x, h.feeHeadId]))}
                                            className={`min-h-11 rounded-full border px-3.5 text-[13.5px] font-medium ${on ? "border-brand bg-brand-soft text-brand-deep" : "border-line bg-white text-ink-soft"}`}
                                        >
                                            + {h.head}
                                        </button>
                                    );
                                })}
                        </fieldset>
                        <button type="button" className="btn-primary min-h-11 sm:ml-auto" disabled={generating || !genMonth} onClick={generate}>
                            Generate for {genMonth ? `${MONTHS[Number(genMonth.slice(5)) - 1]} ${genMonth.slice(0, 4)}` : "…"}
                        </button>
                    </div>
                </Card>
            )}

            <Card
                title={`Fee structure · session ${sessionName}`}
                className="mt-4"
                padded={false}
                actions={
                    canManage &&
                    (edit ? (
                        <div className="flex gap-2">
                            <button type="button" className="btn-ghost min-h-9 px-3.5 text-[13.5px]" onClick={() => (setEdit(false), setValues({}))}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary min-h-9 px-3.5 text-[13.5px]" disabled={busy || bad || !changed.length} onClick={save}>
                                Save {changed.length || ""}
                            </button>
                        </div>
                    ) : (
                        <button type="button" className="text-[13.5px] font-semibold text-brand-deep hover:text-brand" onClick={() => setEdit(true)}>
                            Edit amounts
                        </button>
                    ))
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-line bg-paper/60 text-[12.5px] tracking-wide text-ink-soft uppercase">
                                <th className="px-5 py-2.5 font-semibold">Class</th>
                                {heads.map((h) => (
                                    <th key={h.feeHeadId ?? h.head} className="px-5 py-2.5 text-right font-semibold">
                                        {h.head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {structure.map((c) => (
                                <tr key={c.classId} className="border-b border-line last:border-0">
                                    <td className="px-5 py-2.5 font-medium">{c.className}</td>
                                    {c.heads.map((h) => (
                                        <td key={h.feeHeadId ?? h.head} className="px-5 py-2 text-right tabular-nums">
                                            {edit ? (
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    min={0}
                                                    step={1}
                                                    value={values[key(c.classId, h.feeHeadId)] ?? h.amount}
                                                    onChange={(e) => setValues((v) => ({ ...v, [key(c.classId, h.feeHeadId)]: e.target.value }))}
                                                    aria-label={`${c.className} ${h.head}`}
                                                    className="h-9 w-24 rounded-lg border border-line px-2 text-right text-[14.5px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                                                />
                                            ) : h.amount ? (
                                                `৳ ${money(h.amount)}`
                                            ) : (
                                                <span className="text-ink-soft/60">—</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="border-t border-line px-5 py-3 text-[13px] text-ink-soft">Amounts are whole taka. Changing a fee never edits invoices already issued. Sibling waivers and scholarships are separate discount lines.</p>
            </Card>
        </>
    );
}
