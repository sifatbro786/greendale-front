"use client";

import { Lock } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { DEMO_SAVED, useToast } from "./Toast";

/**
 * Keyboard-friendly marks grid (PRD §6.3). Enter / ↓ moves to the next student, values are validated
 * against full marks, absent is a separate flag. Editable only while the exam is MARKS_OPEN.
 * Phase 2: PUT /api/exams/:examId/marks { sectionId, subjectId, rows } with debounced autosave.
 */
export default function MarksEntry({ exams, options, sheets, initialExam }) {
    const [examId, setExamId] = useState(initialExam);
    const opts = options;
    const [opt, setOpt] = useState(opts[0]?.value);
    const [edits, setEdits] = useState({});
    const [saved, setSaved] = useState(null);
    const toast = useToast();
    const refs = useRef([]);
    const timer = useRef(null);

    const key = `${examId}|${opt}`;
    const sheet = sheets[key];
    const rows = useMemo(() => (sheet?.rows ?? []).map((r) => ({ ...r, ...(edits[key]?.[r.enrollmentId] ?? {}) })), [sheet, edits, key]);

    if (!sheet) return <p className="rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">Select a class and subject.</p>;

    const update = (id, patch) => {
        setEdits((e) => ({ ...e, [key]: { ...(e[key] ?? {}), [id]: { ...(e[key]?.[id] ?? {}), ...patch } } }));
        setSaved("Saving…");
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setSaved("All changes saved (demo, not stored)"), 600);
    };
    const invalid = (r) => r.obtained != null && r.obtained !== "" && (Number(r.obtained) < 0 || Number(r.obtained) > sheet.fullMarks);
    const entered = rows.filter((r) => r.absent || (r.obtained !== null && r.obtained !== "")).length;
    const avg = (() => {
        const v = rows.filter((r) => !r.absent && r.obtained !== null && r.obtained !== "").map((r) => Number(r.obtained));
        return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
    })();

    function onKey(e, i) {
        if (e.key === "Enter" || e.key === "ArrowDown") {
            e.preventDefault();
            refs.current[i + 1]?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            refs.current[i - 1]?.focus();
        }
    }

    return (
        <div>
            <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_1.4fr]">
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Exam</span>
                    <select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                        {exams.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name} {e.status === "MARKS_OPEN" ? "· open" : "· locked"}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Class · Subject</span>
                    <select value={opt} onChange={(e) => setOpt(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                        {opts.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-soft">
                <span>
                    Full marks <b className="text-ink">{sheet.fullMarks}</b> · Pass <b className="text-ink">{sheet.passMarks}</b>
                </span>
                <span>
                    Entered <b className="text-ink">{entered}</b>/{rows.length}
                </span>
                <span>
                    Class average <b className="text-ink">{avg}</b>
                </span>
                <span>Teacher: {sheet.teacher}</span>
                {!sheet.editable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 font-medium text-[#7a5d00]">
                        <Lock className="size-3.5" aria-hidden="true" /> Locked after publish
                    </span>
                ) : (
                    saved && <span className="ml-auto font-medium text-brand-deep">{saved}</span>
                )}
            </div>

            <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full min-w-[440px] text-left text-[14.5px]">
                    <thead>
                        <tr className="border-b border-line bg-paper/60 text-[12.5px] tracking-wide text-ink-soft uppercase">
                            <th className="w-14 px-3 py-3 font-semibold">Roll</th>
                            <th className="px-4 py-3 font-semibold">Student</th>
                            <th className="w-32 px-4 py-3 text-right font-semibold">Marks</th>
                            <th className="w-24 px-4 py-3 text-center font-semibold">Absent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => {
                            const bad = invalid(r);
                            const fail = !r.absent && r.obtained !== null && r.obtained !== "" && Number(r.obtained) < sheet.passMarks;
                            return (
                                <tr key={r.enrollmentId} className="border-b border-line last:border-0">
                                    <td className="px-4 py-2 font-semibold text-ink tabular-nums">{r.roll}</td>
                                    <td className="px-4 py-2 text-ink">{r.name}</td>
                                    <td className="px-4 py-2 text-right">
                                        <input
                                            ref={(el) => (refs.current[i] = el)}
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            max={sheet.fullMarks}
                                            disabled={!sheet.editable || r.absent}
                                            value={r.absent ? "" : (r.obtained ?? "")}
                                            onChange={(e) => update(r.enrollmentId, { obtained: e.target.value === "" ? null : e.target.value })}
                                            onKeyDown={(e) => onKey(e, i)}
                                            aria-label={`Marks for ${r.name}`}
                                            aria-invalid={bad}
                                            className={`h-10 w-24 rounded-lg border px-3 text-right text-[15px] tabular-nums outline-none focus:ring-4 disabled:bg-paper disabled:text-ink-soft ${bad ? "border-coral focus:ring-coral/15" : fail ? "border-sun focus:ring-sun/20" : "border-line focus:border-brand focus:ring-brand/10"}`}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input type="checkbox" checked={r.absent} disabled={!sheet.editable} onChange={(e) => update(r.enrollmentId, { absent: e.target.checked })} className="size-5 accent-[var(--coral)]" aria-label={`${r.name} absent`} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {sheet.editable && (
                <div className="mt-4 flex justify-end">
                    <button type="button" className="btn-primary" onClick={() => toast(DEMO_SAVED, { title: "Marks submitted", tone: "info" })}>
                        Submit marks
                    </button>
                </div>
            )}
        </div>
    );
}
