"use client";

import { Loader2, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";

import Modal from "./Modal";
import { DEMO_SAVED, useToast } from "./Toast";

const DAY = { SAT: "Saturday", SUN: "Sunday", MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday" };
const TONES = ["bg-brand-soft", "bg-sky-soft", "bg-sun-soft", "bg-coral-soft", "bg-[#EEE9FB]", "bg-[#E6F5F3]", "bg-[#F6EBDD]", "bg-[#EDF3E0]"];

/** "t:<staffId>" options are teacher routines, anything else a section id. */
const routineUrl = (id) => (id.startsWith("t:") ? `/api/routine?staffId=${id.slice(2)}` : `/api/routine?sectionId=${id}`);

/**
 * Weekly routine grid (print-friendly). Options switch between class routines (or a teacher's).
 * Live: loads the chosen routine on demand; with canEdit a class routine cell opens an editor
 * (PUT /api/routine/slot; the API refuses a teacher double booking with a clear message).
 * Demo: all routines are passed in.
 * @param {{ options: {value:string,label:string}[], routines?: Record<string, any>, initial?: any, showTeacher?: boolean, canEdit?: boolean, demo?: boolean }} props
 */
export default function RoutineGrid({ options, routines = {}, initial = null, showTeacher = true, canEdit = false, demo = false }) {
    const toast = useToast();
    const [id, setId] = useState(options[0].value);
    const [loaded, setLoaded] = useState(initial ? { [options[0].value]: initial } : {});
    const [editing, setEditing] = useState(false);
    const [cell, setCell] = useState(null); // { day, periodId, current }
    const r = demo ? routines[id] : loaded[id];
    const isSection = !id.startsWith("t:");

    useEffect(() => {
        if (demo || loaded[id]) return;
        let off = false;
        api(routineUrl(id)).then((res) => {
            if (off) return;
            if (res.ok) setLoaded((m) => ({ ...m, [id]: res.data }));
            else toast(res.error.message, { title: "Could not load the routine", tone: "error" });
        });
        return () => {
            off = true;
        };
    }, [demo, id, loaded, toast]);

    if (!r) {
        return (
            <p className="flex items-center gap-2 p-6 text-ink-soft">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading routine…
            </p>
        );
    }

    const subjects = [...new Set(r.cells.map((c) => c.subject))];
    const tone = (s) => TONES[subjects.indexOf(s) % TONES.length];
    const editable = canEdit && isSection && editing;

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 print:hidden">
                {options.length > 1 && (
                    <select
                        value={id}
                        onChange={(e) => {
                            setId(e.target.value);
                            setEditing(false);
                        }}
                        className="h-10 rounded-xl border border-line bg-white px-3 text-[14.5px]"
                    >
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                )}
                <p className="text-[14px] text-ink-soft">{r.title}</p>
                <div className="ml-auto flex gap-2">
                    {canEdit && isSection && (
                        <button type="button" onClick={() => setEditing((e) => !e)} className={editing ? "btn-primary min-h-10 text-[14px]" : "btn-ghost min-h-10 text-[14px]"}>
                            <Pencil className="size-4" aria-hidden="true" /> {editing ? "Done editing" : "Edit routine"}
                        </button>
                    )}
                    <button type="button" onClick={() => window.print()} className="btn-ghost min-h-10 text-[14px]">
                        <Printer className="size-4" aria-hidden="true" /> Print
                    </button>
                </div>
            </div>
            {editable && <p className="border-b border-line bg-sun-soft/60 px-4 py-2 text-[13.5px] text-ink print:hidden">Tap a period to set the subject and teacher. Changes save one by one.</p>}
            <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[760px] border-separate border-spacing-1.5 text-[13.5px]">
                    <thead>
                        <tr>
                            <th className="w-28 text-left text-[12px] font-semibold text-ink-soft uppercase" />
                            {r.periods.map((p) => (
                                <th key={p.id} className="px-2 pb-1 text-left font-semibold text-ink">
                                    Period {p.number}
                                    <span className="block text-[12px] font-normal text-ink-soft tabular-nums">
                                        {p.start}–{p.end}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {r.days.map((d) => (
                            <tr key={d}>
                                <th scope="row" className="pr-2 text-left font-semibold text-ink">
                                    {DAY[d]}
                                </th>
                                {r.periods.map((p) => {
                                    const c = r.cells.find((x) => x.day === d && x.periodId === p.id);
                                    const content = c ? (
                                        <>
                                            <span className="block font-semibold text-ink">{c.subject}</span>
                                            <span className="block text-[12px] text-ink-soft">{showTeacher ? c.teacher : c.section}</span>
                                        </>
                                    ) : (
                                        <span className="text-[12px] text-ink-soft/70">{editable ? "+ Add" : "Activity / library"}</span>
                                    );
                                    return (
                                        <td key={p.id} className={`h-16 rounded-xl align-top ${c ? tone(c.subject) : "bg-paper"}`}>
                                            {editable ? (
                                                <button type="button" onClick={() => setCell({ day: d, periodId: p.id, number: p.number, current: c })} className="h-full w-full rounded-xl px-3 py-2 text-left outline-offset-2 hover:ring-2 hover:ring-brand/40">
                                                    {content}
                                                </button>
                                            ) : (
                                                <div className="px-3 py-2">{content}</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="mt-3 text-[12.5px] text-ink-soft">A teacher can never be booked in two classes in the same period (database rule).</p>
            </div>
            {cell && (
                <CellEditor
                    sectionId={id}
                    cell={cell}
                    demo={demo}
                    onClose={() => setCell(null)}
                    onSaved={(data) => {
                        setLoaded((m) => {
                            // Teacher routines may have changed too: drop them so they reload when opened.
                            const next = Object.fromEntries(Object.entries(m).filter(([k]) => !k.startsWith("t:")));
                            return { ...next, [id]: data };
                        });
                        setCell(null);
                    }}
                />
            )}
        </div>
    );
}

function CellEditor({ sectionId, cell, demo, onClose, onSaved }) {
    const toast = useToast();
    const [opts, setOpts] = useState(null);
    const [subjectId, setSubjectId] = useState(cell.current?.subjectId ?? "");
    const [staffId, setStaffId] = useState(cell.current?.staffId ?? "");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (demo) return;
        let off = false;
        api(`/api/routine/options?sectionId=${sectionId}`).then((r) => !off && r.ok && setOpts(r.data));
        return () => {
            off = true;
        };
    }, [demo, sectionId]);

    async function save(clear = false) {
        if (demo) return (onClose(), toast(DEMO_SAVED, { title: "Routine", tone: "info" }));
        setBusy(true);
        const r = await api("/api/routine/slot", { method: "PUT", body: { sectionId, day: cell.day, periodId: cell.periodId, subjectId: clear ? null : subjectId || null, staffId: clear ? null : staffId || null } });
        setBusy(false);
        if (!r.ok) return toast(r.error.message, { title: "Not saved", tone: "error" });
        onSaved(r.data);
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={`${DAY[cell.day]} · Period ${cell.number}`}
            size="sm"
            footer={
                <>
                    {cell.current && (
                        <button type="button" className="btn-ghost mr-auto min-h-10 text-[14px] hover:text-coral" onClick={() => save(true)} disabled={busy}>
                            Clear
                        </button>
                    )}
                    <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={() => save(false)} disabled={busy || !subjectId}>
                        Save
                    </button>
                </>
            }
        >
            {!opts && !demo ? (
                <p className="flex items-center gap-2 text-ink-soft">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
                </p>
            ) : (
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-[14px] font-medium text-ink">Subject</span>
                        <select
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                const t = opts?.assignments?.[e.target.value];
                                if (t) setStaffId(t);
                            }}
                            className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]"
                        >
                            <option value="">Choose a subject</option>
                            {(opts?.subjects ?? []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-[14px] font-medium text-ink">Teacher</span>
                        <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                            <option value="">No teacher yet</option>
                            {(opts?.staff ?? []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                    {opts?.assignments?.[subjectId] === s.id ? " (subject teacher)" : ""}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            )}
        </Modal>
    );
}
