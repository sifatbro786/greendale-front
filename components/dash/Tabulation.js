"use client";

import { Printer, Send } from "lucide-react";
import { useState } from "react";

import Modal from "./Modal";
import { DEMO_SAVED, useToast } from "./Toast";

/**
 * Tabulation sheet + publish flow. Publishing writes ResultSnapshot rows, locks marks and queues one
 * result SMS per guardian (PRD §6.3). Phase 2: POST /api/exams/:id/publish (results.publish permission).
 */
export default function Tabulation({ exams, sections, data, canPublish }) {
    const [examId, setExamId] = useState(exams.findLast((e) => e.status === "PUBLISHED")?.id ?? exams[0].id);
    const [sectionId, setSectionId] = useState(sections[0].value);
    const [confirm, setConfirm] = useState(false);
    const toast = useToast();
    const t = data[`${examId}|${sectionId}`];
    const exam = exams.find((e) => e.id === examId);

    return (
        <div>
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end print:hidden">
                <label className="sm:w-72">
                    <span className="text-[13px] font-medium text-ink-soft">Exam</span>
                    <select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-[14.5px]">
                        {exams.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="sm:w-56">
                    <span className="text-[13px] font-medium text-ink-soft">Class</span>
                    <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-[14.5px]">
                        {sections.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="flex gap-2 sm:ml-auto">
                    <button type="button" onClick={() => window.print()} className="btn-ghost min-h-10 text-[14px]">
                        <Printer className="size-4" aria-hidden="true" /> Print
                    </button>
                    {canPublish && exam.status !== "PUBLISHED" && (
                        <button type="button" onClick={() => setConfirm(true)} className="btn-primary min-h-10 text-[14px]">
                            <Send className="size-4" aria-hidden="true" /> Publish results
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-[14px] text-ink-soft">
                <span>
                    <b className="text-ink">{t.stats.students}</b> students
                </span>
                <span>
                    <b className="text-ink">{t.stats.passed}</b> passed
                </span>
                <span>
                    <b className="text-ink">{t.stats.aPlus}</b> A+
                </span>
                {t.stats.incomplete > 0 && <span className="font-medium text-[#8a6a00]">{t.stats.incomplete} with marks missing</span>}
                {t.remarksMode && <span>Early years: progress report with remarks is printed instead of grades</span>}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-[13.5px]">
                    <thead>
                        <tr className="border-y border-line bg-paper/60 text-[11.5px] tracking-wide text-ink-soft uppercase">
                            <th className="sticky left-0 bg-[#fbfaf6] px-3 py-2.5 font-semibold">Roll</th>
                            <th className="sticky left-12 bg-[#fbfaf6] px-3 py-2.5 font-semibold">Student</th>
                            {t.subjects.map((s) => (
                                <th key={s} className="px-2 py-2.5 text-right font-semibold" title={s}>
                                    {s.replace("English ", "Eng ").replace("Bangladesh & Global Studies", "BGS").replace("1st Paper", "I").replace("2nd Paper", "II").replace("Rhymes & Drawing", "Rhymes")}
                                </th>
                            ))}
                            <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                            <th className="px-3 py-2.5 text-right font-semibold">GPA</th>
                            <th className="px-3 py-2.5 font-semibold">Grade</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Pos.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {t.rows.map((r) => (
                            <tr key={r.roll} className="border-b border-line last:border-0 hover:bg-paper/50">
                                <td className="sticky left-0 bg-white px-3 py-2 font-semibold tabular-nums">{r.roll}</td>
                                <td className="sticky left-12 bg-white px-3 py-2 whitespace-nowrap">{r.name}</td>
                                {r.marks.map((m, i) => (
                                    <td key={i} className={`px-2 py-2 text-right tabular-nums ${m === "AB" ? "text-coral" : m === "—" ? "text-ink-soft/50" : Number(m) < 33 ? "font-semibold text-coral" : ""}`}>
                                        {m}
                                    </td>
                                ))}
                                <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.complete ? r.total : "—"}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{r.complete ? r.gpa.toFixed(2) : "—"}</td>
                                <td className="px-3 py-2">{r.complete ? <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${r.failed ? "bg-coral-soft text-[#b4432a]" : r.grade === "A+" ? "bg-brand-soft text-brand-deep" : "bg-sky-soft text-[#1d6f9c]"}`}>{r.grade}</span> : "—"}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{r.complete ? r.position : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                open={confirm}
                onClose={() => setConfirm(false)}
                title={`Publish ${exam.name}?`}
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirm(false)}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary min-h-10 text-[14px]"
                            onClick={() => {
                                setConfirm(false);
                                toast(DEMO_SAVED, { title: "Results would be published", tone: "info" });
                            }}
                        >
                            Publish
                        </button>
                    </>
                }
            >
                <ul className="space-y-2.5 text-[14.5px] text-ink">
                    <li>• Results are frozen as a snapshot. Later edits to marks will not change them.</li>
                    <li>• Marks are locked. Only the Super Admin can unpublish (recorded in the audit log).</li>
                    <li>• Guardians see results in the portal and get one SMS each.</li>
                    {t.stats.incomplete > 0 && <li className="font-medium text-[#8a6a00]">• {t.stats.incomplete} students in this class still have missing marks.</li>}
                </ul>
            </Modal>
        </div>
    );
}
