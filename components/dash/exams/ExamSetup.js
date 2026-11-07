"use client";

import { Lock } from "lucide-react";
import { useMemo, useState } from "react";

import { errorText, field, fieldBorder, label } from "../admin/fields";
import { useApiAction } from "../academics/useApiAction";
import { Badge, Card } from "../ui";

const cell = "h-10 w-full rounded-lg border border-line bg-white px-2.5 text-[15px] tabular-nums outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-paper disabled:text-ink-soft";

/**
 * Exam setup: name/dates (PATCH /api/exams/:id) and per-subject full/pass marks + schedule
 * (PUT /api/exams/:id/subjects, only changed rows). Read-only once marks are locked.
 */
export default function ExamSetup({ exam, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const editable = exam.status === "DRAFT" || exam.status === "MARKS_OPEN";
    const [info, setInfo] = useState({ name: exam.name, shortName: exam.shortName ?? "", startDate: exam.startDate ?? "", endDate: exam.endDate ?? "" });
    const original = useMemo(() => new Map(exam.classes.flatMap((c) => c.subjects.map((s) => [s.examSubjectId, s]))), [exam]);
    const [edits, setEdits] = useState({});
    const row = (s) => ({ ...s, ...edits[s.examSubjectId] });
    const set = (id, k) => (e) => setEdits((m) => ({ ...m, [id]: { ...m[id], [k]: e.target.value } }));

    const changed = Object.entries(edits)
        .map(([id, patch]) => ({ ...original.get(id), ...patch }))
        .filter((s) => {
            const o = original.get(s.examSubjectId);
            return String(s.fullMarks) !== String(o.fullMarks) || String(s.passMarks) !== String(o.passMarks) || (s.examDate || null) !== (o.examDate || null) || (s.startTime || null) !== (o.startTime || null);
        });
    const invalid = changed.find((s) => !(Number(s.fullMarks) >= 1) || !(Number(s.passMarks) >= 0) || Number(s.passMarks) > Number(s.fullMarks));

    /** Copies the first subject's full/pass marks to the class (common case: every subject out of 100). */
    const sameForClass = (c) => {
        const first = row(c.subjects[0]);
        setEdits((m) => ({ ...m, ...Object.fromEntries(c.subjects.map((s) => [s.examSubjectId, { ...m[s.examSubjectId], fullMarks: first.fullMarks, passMarks: first.passMarks }])) }));
    };

    async function saveSubjects() {
        if (!changed.length || invalid) return;
        const items = changed.map((s) => ({ examSubjectId: s.examSubjectId, fullMarks: Number(s.fullMarks), passMarks: Number(s.passMarks), examDate: s.examDate || null, startTime: s.startTime || null }));
        const r = await run(`/api/exams/${exam.id}/subjects`, "PUT", { items }, { success: `${items.length} subject${items.length > 1 ? "s" : ""} updated.` });
        if (r) setEdits({});
    }

    const infoChanged = info.name !== exam.name || info.shortName !== (exam.shortName ?? "") || info.startDate !== (exam.startDate ?? "") || info.endDate !== (exam.endDate ?? "");
    const saveInfo = () =>
        run(`/api/exams/${exam.id}`, "PATCH", { name: info.name, shortName: info.shortName || null, startDate: info.startDate || null, endDate: info.endDate || null }, { success: "Exam details saved." });
    const badDates = info.startDate && info.endDate && info.endDate < info.startDate;

    return (
        <>
            {!editable && (
                <p className="mb-4 flex items-center gap-2 rounded-2xl border border-sun/50 bg-sun-soft px-4 py-3 text-[14px] text-[#7a5d00]">
                    <Lock className="size-4" aria-hidden="true" /> Marks are {exam.status === "PUBLISHED" ? "published" : "locked"}, so the setup is read only. Reopen marks entry to change it.
                </p>
            )}
            <Card title="Exam details" className="mb-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="sm:col-span-2 lg:col-span-1">
                        <span className={label}>Name</span>
                        <input value={info.name} disabled={exam.status === "PUBLISHED"} onChange={(e) => setInfo((s) => ({ ...s, name: e.target.value }))} className={`${field} ${fieldBorder(false)}`} />
                    </label>
                    <label>
                        <span className={label}>Short name</span>
                        <input value={info.shortName} disabled={exam.status === "PUBLISHED"} onChange={(e) => setInfo((s) => ({ ...s, shortName: e.target.value }))} className={`${field} ${fieldBorder(false)}`} />
                    </label>
                    <label>
                        <span className={label}>Starts</span>
                        <input type="date" value={info.startDate} disabled={exam.status === "PUBLISHED"} onChange={(e) => setInfo((s) => ({ ...s, startDate: e.target.value }))} className={`${field} ${fieldBorder(false)}`} />
                    </label>
                    <label>
                        <span className={label}>Ends</span>
                        <input type="date" value={info.endDate} disabled={exam.status === "PUBLISHED"} onChange={(e) => setInfo((s) => ({ ...s, endDate: e.target.value }))} className={`${field} ${fieldBorder(badDates)}`} />
                        {badDates && <span className={errorText}>Must be on or after the start date.</span>}
                    </label>
                </div>
                {infoChanged && exam.status !== "PUBLISHED" && (
                    <div className="mt-4 flex justify-end">
                        <button type="button" className="btn-primary min-h-10 text-[14px]" disabled={busy || badDates || info.name.trim().length < 3} onClick={saveInfo}>
                            Save details
                        </button>
                    </div>
                )}
            </Card>

            <div className="space-y-4 pb-20">
                {exam.classes.map((c) => (
                    <Card
                        key={c.classId}
                        title={c.name}
                        description={c.gradingMode === "REMARKS" ? "Progress report: teachers write remarks, marks are optional." : undefined}
                        padded={false}
                        actions={
                            editable &&
                            c.subjects.length > 1 && (
                                <button type="button" onClick={() => sameForClass(c)} className="text-[13.5px] font-semibold text-brand-deep hover:text-brand">
                                    Same marks for all
                                </button>
                            )
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-[14px]">
                                <thead>
                                    <tr className="border-b border-line bg-paper/60 text-[12px] tracking-wide text-ink-soft uppercase">
                                        <th className="px-5 py-2.5 font-semibold">Subject</th>
                                        <th className="w-24 px-2 py-2.5 font-semibold">Full</th>
                                        <th className="w-24 px-2 py-2.5 font-semibold">Pass</th>
                                        <th className="w-44 px-2 py-2.5 font-semibold">Exam date</th>
                                        <th className="w-32 px-2 py-2.5 font-semibold">Starts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {c.subjects.map((s0) => {
                                        const s = row(s0);
                                        const bad = Number(s.passMarks) > Number(s.fullMarks);
                                        return (
                                            <tr key={s.examSubjectId} className="border-b border-line last:border-0">
                                                <td className="px-5 py-2">
                                                    <span className="font-medium text-ink">{s.name}</span>
                                                    {s.hasMarks && (
                                                        <Badge tone="blue" className="ml-2">
                                                            marks entered
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" inputMode="numeric" min={1} max={500} value={s.fullMarks} disabled={!editable} onChange={set(s.examSubjectId, "fullMarks")} aria-label={`${s.name} full marks`} className={cell} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" inputMode="numeric" min={0} max={500} value={s.passMarks} disabled={!editable} onChange={set(s.examSubjectId, "passMarks")} aria-label={`${s.name} pass marks`} aria-invalid={bad} className={`${cell} ${bad ? "border-coral" : ""}`} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="date" value={s.examDate ?? ""} min={info.startDate || undefined} max={info.endDate || undefined} disabled={!editable} onChange={set(s.examSubjectId, "examDate")} aria-label={`${s.name} exam date`} className={cell} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="time" value={s.startTime ?? ""} disabled={!editable} onChange={set(s.examSubjectId, "startTime")} aria-label={`${s.name} start time`} className={cell} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
            </div>

            {editable && changed.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0">
                    <div className="flex items-center justify-end gap-3">
                        <span className="text-[14px] text-ink-soft">{invalid ? "Pass marks cannot be above full marks." : `${changed.length} unsaved change${changed.length > 1 ? "s" : ""}`}</span>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setEdits({})}>
                            Discard
                        </button>
                        <button type="button" className="btn-primary min-h-10 text-[14px]" disabled={busy || Boolean(invalid)} onClick={saveSubjects}>
                            Save subjects
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
