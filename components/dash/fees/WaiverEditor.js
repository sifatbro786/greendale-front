"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { label } from "../admin/fields";
import { useApiAction } from "../academics/useApiAction";

const money = (n) => `৳ ${new Intl.NumberFormat("en-IN").format(n)}`;

/**
 * Standing waivers for the current session (sibling, staff child, scholarship):
 * PUT /api/fees/students/:id/concessions, DELETE /api/fees/concessions/:id (fees.manage).
 * They apply to invoices generated from now on; issued invoices keep their discount.
 */
export default function WaiverEditor({ studentId, data, canManage, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const [items, setItems] = useState(data.items);
    const free = data.heads.filter((h) => !items.some((i) => i.feeHeadId === h.value));
    const [v, setV] = useState({ feeHeadId: free.find((h) => h.type === "MONTHLY")?.value ?? free[0]?.value ?? "", kind: "percent", value: "50", reason: "Sibling waiver" });
    const n = Number(v.value);
    const bad = !v.feeHeadId || !Number.isInteger(n) || n < 1 || (v.kind === "percent" && n > 100) || v.reason.trim().length < 3;

    async function add() {
        const body = { feeHeadId: v.feeHeadId, reason: v.reason.trim(), ...(v.kind === "percent" ? { percent: n } : { amount: n }) };
        const r = await run(`/api/fees/students/${studentId}/concessions`, "PUT", body, { success: "Waiver saved. It applies to invoices generated from now on." });
        if (r) setItems(r.items);
    }
    async function remove(id) {
        const r = await run(`/api/fees/concessions/${id}`, "DELETE", undefined, { success: "Waiver removed for future invoices." });
        if (r) setItems(r.items);
    }

    return (
        <div>
            <h3 className="text-[15px] font-semibold text-ink">Waivers · session {data.session}</h3>
            {items.length ? (
                <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                    {items.map((i) => (
                        <li key={i.id} className="flex items-center gap-3 px-4 py-2.5 text-[14px]">
                            <span className="flex-1">
                                <b className="font-medium">{i.head}</b> · {i.percent != null ? `${i.percent}%` : money(i.amount)} <span className="text-ink-soft">· {i.reason}</span>
                            </span>
                            {canManage && (
                                <button type="button" disabled={busy} onClick={() => remove(i.id)} className="grid size-9 place-items-center rounded-full text-coral hover:bg-coral-soft" aria-label={`Remove ${i.head} waiver`}>
                                    <Trash2 className="size-4" aria-hidden="true" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2 text-[14px] text-ink-soft">No waiver.</p>
            )}
            {canManage && free.length > 0 && (
                <div className="mt-3 grid gap-3 rounded-xl bg-paper/60 p-3 sm:grid-cols-[1.2fr_0.8fr_0.7fr_1.3fr_auto] sm:items-end">
                    <label>
                        <span className={label}>Fee</span>
                        <select value={v.feeHeadId} onChange={(e) => setV((s) => ({ ...s, feeHeadId: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-[14.5px]">
                            {free.map((h) => (
                                <option key={h.value} value={h.value}>
                                    {h.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span className={label}>Type</span>
                        <select value={v.kind} onChange={(e) => setV((s) => ({ ...s, kind: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-[14.5px]">
                            <option value="percent">Percent</option>
                            <option value="amount">Fixed ৳</option>
                        </select>
                    </label>
                    <label>
                        <span className={label}>{v.kind === "percent" ? "%" : "Taka"}</span>
                        <input type="number" inputMode="numeric" min={1} max={v.kind === "percent" ? 100 : undefined} value={v.value} onChange={(e) => setV((s) => ({ ...s, value: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-[14.5px] tabular-nums" />
                    </label>
                    <label>
                        <span className={label}>Reason</span>
                        <input value={v.reason} maxLength={120} onChange={(e) => setV((s) => ({ ...s, reason: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-[14.5px]" />
                    </label>
                    <button type="button" className="btn-primary min-h-10 text-[14px]" disabled={busy || bad} onClick={add}>
                        Add
                    </button>
                </div>
            )}
        </div>
    );
}
