"use client";

import { Loader2, Lock, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "./Toast";

const filled = (v) => v !== null && v !== undefined && v !== "";

/**
 * Keyboard-friendly marks grid (PRD §6.3). Enter / ↓ moves to the next student, values are checked
 * against full marks (half marks allowed), absent is a separate flag. Editable only while MARKS_OPEN.
 * REMARKS classes (Play Group–KG) get a remark box; marks are optional there.
 * Live: one sheet at a time (GET /api/exams/:id/marks), Save sends only changed rows (PUT same URL).
 * Demo: every sheet is passed in and Save only shows a toast.
 */
export default function MarksEntry({ exams, options, sheets = {}, initial = null, initialExam, demo = false }) {
    const toast = useToast();
    const [examId, setExamId] = useState(initial?.exam.id ?? initialExam);
    const [opt, setOpt] = useState(initial ? `${initial.sectionId}|${initial.subjectId}` : options[0]?.value);
    const [loaded, setLoaded] = useState(initial ? { [`${initial.exam.id}|${initial.sectionId}|${initial.subjectId}`]: initial } : {});
    const [missing, setMissing] = useState({});
    const [edits, setEdits] = useState({});
    const [busy, setBusy] = useState(false);
    const refs = useRef([]);

    const key = `${examId}|${opt}`;
    const sheet = demo ? sheets[key] : loaded[key];
    const pending = edits[key] ?? {};
    const dirty = Object.keys(pending).length > 0;
    const anyDirty = Object.values(edits).some((e) => Object.keys(e).length);

    useEffect(() => {
        if (demo || !opt || !examId || loaded[key] || missing[key]) return;
        let cancelled = false;
        const [sectionId, subjectId] = opt.split("|");
        api(`/api/exams/${examId}/marks?sectionId=${sectionId}&subjectId=${subjectId}`).then((r) => {
            if (cancelled) return;
            if (r.ok) setLoaded((m) => ({ ...m, [key]: r.data }));
            else {
                setMissing((m) => ({ ...m, [key]: r.status === 404 ? "This subject is not part of the exam for this class." : r.error.message }));
                if (r.status !== 404) toast(r.error.message, { title: "Could not load marks", tone: "error" });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [demo, key, opt, examId, loaded, missing, toast]);

    useEffect(() => {
        if (!anyDirty) return;
        const warn = (e) => e.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [anyDirty]);

    const rows = useMemo(() => (sheet?.rows ?? []).map((r) => ({ ...r, ...pending[r.enrollmentId] })), [sheet, pending]);
    const remarksMode = sheet?.gradingMode === "REMARKS";

    if (!options.length) return <p className="rounded-2xl border border-line bg-white p-6 text-ink-soft">No subject is assigned to you yet. Ask the office to set you as a subject teacher.</p>;
    if (!exams.length) return <p className="rounded-2xl border border-line bg-white p-6 text-ink-soft">No exam has been created for this session yet.</p>;

    const update = (id, patch) => setEdits((e) => ({ ...e, [key]: { ...(e[key] ?? {}), [id]: { ...(e[key]?.[id] ?? {}), ...patch } } }));
    const invalid = (r) => filled(r.obtained) && (Number(r.obtained) < 0 || Number(r.obtained) > sheet.fullMarks || !Number.isInteger(Number(r.obtained) * 2));
    const bad = rows.filter(invalid).length;
    const entered = rows.filter((r) => r.absent || filled(r.obtained) || (remarksMode && filled(r.remarks))).length;
    const values = rows.filter((r) => !r.absent && filled(r.obtained) && !invalid(r)).map((r) => Number(r.obtained));
    const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;

    function onKey(e, i) {
        if (e.key === "Enter" || e.key === "ArrowDown") {
            e.preventDefault();
            refs.current[i + 1]?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            refs.current[i - 1]?.focus();
        }
    }

    async function save() {
        if (!sheet || !dirty || bad) return;
        if (demo) return toast(DEMO_SAVED, { title: "Marks saved", tone: "info" });
        const changed = rows
            .filter((r) => pending[r.enrollmentId])
            .map((r) => ({ enrollmentId: r.enrollmentId, absent: Boolean(r.absent), obtained: r.absent || !filled(r.obtained) ? null : Number(r.obtained), remarks: remarksMode ? (r.remarks?.trim() || null) : null }));
        setBusy(true);
        const r = await api(`/api/exams/${examId}/marks`, { method: "PUT", body: { sectionId: sheet.sectionId, subjectId: sheet.subjectId, rows: changed } });
        setBusy(false);
        if (!r.ok) return toast(r.error.message, { title: "Not saved", tone: "error" });
        const byId = new Map(changed.map((c) => [c.enrollmentId, c]));
        setLoaded((m) => ({ ...m, [key]: { ...sheet, rows: sheet.rows.map((x) => ({ ...x, ...byId.get(x.enrollmentId) })) } }));
        setEdits((e) => ({ ...e, [key]: {} }));
        toast(`${r.data.entered} of ${r.data.total} students have marks for ${sheet.subject}.`, { title: "Marks saved" });
    }

    const examMeta = exams.find((e) => e.id === examId);

    return (
        <div className="pb-24 sm:pb-0">
            <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_1.4fr]">
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Exam</span>
                    <select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                        {exams.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name} {e.status === "MARKS_OPEN" ? "· open" : e.status === "DRAFT" ? "· not open yet" : "· locked"}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Class · Subject</span>
                    <select value={opt} onChange={(e) => setOpt(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                                {Object.keys(edits[`${examId}|${o.value}`] ?? {}).length ? " • unsaved" : ""}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {!sheet ? (
                <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">
                    {missing[key] ?? (
                        <>
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading students…
                        </>
                    )}
                </p>
            ) : (
                <>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-soft">
                        <span>
                            Full marks <b className="text-ink">{sheet.fullMarks}</b> · Pass <b className="text-ink">{sheet.passMarks}</b>
                        </span>
                        <span>
                            Entered <b className="text-ink">{entered}</b>/{rows.length}
                        </span>
                        {!remarksMode && (
                            <span>
                                Class average <b className="text-ink">{avg}</b>
                            </span>
                        )}
                        <span>Teacher: {sheet.teacher}</span>
                        {!sheet.editable && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 font-medium text-[#7a5d00]">
                                <Lock className="size-3.5" aria-hidden="true" /> {examMeta?.status === "DRAFT" ? "Marks entry is not open yet" : examMeta?.status === "PUBLISHED" ? "Locked after publish" : "Marks are locked"}
                            </span>
                        )}
                        {remarksMode && <span>Progress report class: write a short remark; marks are optional.</span>}
                    </div>

                    <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
                        <table className={`w-full text-left text-[14.5px] ${remarksMode ? "min-w-[640px]" : "min-w-[440px]"}`}>
                            <thead>
                                <tr className="border-b border-line bg-paper/60 text-[12.5px] tracking-wide text-ink-soft uppercase">
                                    <th className="w-14 px-3 py-3 font-semibold">Roll</th>
                                    <th className="px-4 py-3 font-semibold">Student</th>
                                    <th className="w-32 px-4 py-3 text-right font-semibold">Marks</th>
                                    {remarksMode && <th className="px-4 py-3 font-semibold">Remark</th>}
                                    <th className="w-24 px-4 py-3 text-center font-semibold">Absent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => {
                                    const wrong = invalid(r);
                                    const fail = !remarksMode && !r.absent && filled(r.obtained) && !wrong && Number(r.obtained) < sheet.passMarks;
                                    return (
                                        <tr key={r.enrollmentId} className={`border-b border-line last:border-0 ${pending[r.enrollmentId] ? "bg-sky-soft/30" : ""}`}>
                                            <td className="px-4 py-2 font-semibold text-ink tabular-nums">{r.roll}</td>
                                            <td className="px-4 py-2 text-ink">{r.name}</td>
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    ref={(el) => (refs.current[i] = el)}
                                                    type="number"
                                                    inputMode="decimal"
                                                    step={0.5}
                                                    min={0}
                                                    max={sheet.fullMarks}
                                                    disabled={!sheet.editable || r.absent}
                                                    value={r.absent ? "" : (r.obtained ?? "")}
                                                    onChange={(e) => update(r.enrollmentId, { obtained: e.target.value === "" ? null : e.target.value })}
                                                    onKeyDown={(e) => onKey(e, i)}
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    aria-label={`Marks for ${r.name}`}
                                                    aria-invalid={wrong}
                                                    className={`h-10 w-24 rounded-lg border px-3 text-right text-[15px] tabular-nums outline-none focus:ring-4 disabled:bg-paper disabled:text-ink-soft ${wrong ? "border-coral focus:ring-coral/15" : fail ? "border-sun focus:ring-sun/20" : "border-line focus:border-brand focus:ring-brand/10"}`}
                                                />
                                            </td>
                                            {remarksMode && (
                                                <td className="px-4 py-2">
                                                    <input
                                                        value={r.remarks ?? ""}
                                                        maxLength={300}
                                                        disabled={!sheet.editable}
                                                        onChange={(e) => update(r.enrollmentId, { remarks: e.target.value })}
                                                        placeholder="Reads well, needs practice with numbers"
                                                        aria-label={`Remark for ${r.name}`}
                                                        className="h-10 w-full min-w-56 rounded-lg border border-line px-3 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-paper"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-2 text-center">
                                                <input type="checkbox" checked={Boolean(r.absent)} disabled={!sheet.editable} onChange={(e) => update(r.enrollmentId, { absent: e.target.checked })} className="size-5 accent-[var(--coral)]" aria-label={`${r.name} absent`} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {sheet.editable && (
                        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0">
                            <div className="flex items-center justify-end gap-3">
                                <span className={`text-[14px] ${bad ? "font-medium text-coral" : "text-ink-soft"}`}>
                                    {bad ? `${bad} mark${bad > 1 ? "s" : ""} above ${sheet.fullMarks} or not a whole/half number` : dirty ? `${Object.keys(pending).length} unsaved` : "All saved"}
                                </span>
                                <button type="button" className="btn-primary" disabled={busy || !dirty || bad > 0} onClick={save}>
                                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />} Save marks
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
