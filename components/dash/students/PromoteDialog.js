"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";

import { field, hint, label } from "../admin/fields";
import Modal from "../Modal";
import { useToast } from "../Toast";

/**
 * Year-end promotion: pick a class, tick who moves up, choose the class in the next session.
 * POST /api/students/promote (one transaction; already-promoted students are skipped).
 */
export default function PromoteDialog({ sections, sessions, onClose }) {
    const router = useRouter();
    const toast = useToast();
    const targets = sessions.filter((s) => !s.isCurrent);
    const [from, setFrom] = useState(sections[0]?.value ?? "");
    const [toSession, setToSession] = useState(targets[0]?.id ?? "");
    const [to, setTo] = useState(sections[1]?.value ?? sections[0]?.value ?? "");
    const [rollMode, setRollMode] = useState("keep");
    const [lists, setLists] = useState({});
    const list = lists[from] ?? null;
    const [picked, setPicked] = useState(new Set());
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!from) return;
        let off = false;
        api(`/api/students?sectionId=${from}`).then((r) => {
            if (off || !r.ok) return;
            setLists((m) => ({ ...m, [from]: r.data }));
            setPicked(new Set(r.data.map((s) => s.id)));
            const idx = sections.findIndex((s) => s.value === from);
            if (sections[idx + 1]) setTo(sections[idx + 1].value);
        });
        return () => {
            off = true;
        };
    }, [from, sections]);

    async function run() {
        setBusy(true);
        const r = await api("/api/students/promote", { method: "POST", body: { fromSectionId: from, toSessionId: toSession, toSectionId: to, studentIds: [...picked], rollMode } });
        setBusy(false);
        if (!r.ok) return toast(Object.values(r.fieldErrors)[0] ?? r.error.message, { title: "Not promoted", tone: "error" });
        toast(`${r.data.promoted} promoted${r.data.skipped ? `, ${r.data.skipped} skipped (already in that session or not active)` : ""}.`, { title: "Promotion done" });
        router.refresh();
        onClose();
    }

    const toggle = (id) => setPicked((s) => (s.has(id) ? (s.delete(id), new Set(s)) : new Set(s.add(id))));

    return (
        <Modal
            open
            onClose={onClose}
            title="Promote students"
            size="lg"
            footer={
                <>
                    <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={run} disabled={busy || !picked.size || !toSession}>
                        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Promote {picked.size}
                    </button>
                </>
            }
        >
            {!targets.length ? (
                <p className="text-[15px] text-ink-soft">First create next year&apos;s session in Classes &amp; subjects. Promote every class, then make the new session current.</p>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label>
                            <span className={label}>From (this session)</span>
                            <select value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} border-line`}>
                                {sections.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={label}>To session</span>
                            <select value={toSession} onChange={(e) => setToSession(e.target.value)} className={`${field} border-line`}>
                                {targets.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={label}>To class</span>
                            <select value={to} onChange={(e) => setTo(e.target.value)} className={`${field} border-line`}>
                                {sections.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={label}>Roll numbers</span>
                            <select value={rollMode} onChange={(e) => setRollMode(e.target.value)} className={`${field} border-line`}>
                                <option value="keep">Keep the same rolls</option>
                                <option value="name">1, 2, 3 … by name</option>
                            </select>
                            <span className={hint}>Merit-based rolls come with results (Step 4).</span>
                        </label>
                    </div>
                    <div className="rounded-xl border border-line">
                        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13.5px]">
                            <span className="text-ink-soft">Untick students who stay in the same class or are leaving.</span>
                            {list && (
                                <button type="button" className="font-semibold text-brand-deep" onClick={() => setPicked(picked.size === list.length ? new Set() : new Set(list.map((s) => s.id)))}>
                                    {picked.size === list.length ? "Untick all" : "Tick all"}
                                </button>
                            )}
                        </div>
                        {!list ? (
                            <p className="flex items-center gap-2 px-4 py-6 text-ink-soft">
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
                            </p>
                        ) : (
                            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
                                {list.map((s) => (
                                    <li key={s.id}>
                                        <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-paper">
                                            <input type="checkbox" checked={picked.has(s.id)} onChange={() => toggle(s.id)} className="size-4 accent-[var(--brand)]" />
                                            <span className="w-8 text-[13px] text-ink-soft tabular-nums">{s.roll}</span>
                                            <span className="text-[15px] text-ink">{s.name}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
}
