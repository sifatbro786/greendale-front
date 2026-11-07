"use client";

import { Loader2, Printer, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";

import Modal from "./Modal";
import { DEMO_SAVED, useToast } from "./Toast";

const short = (s) => s.replace("English ", "Eng ").replace("Bangladesh & Global Studies", "BGS").replace("1st Paper", "I").replace("2nd Paper", "II").replace("Rhymes & Drawing", "Rhymes");
const cellOf = (l) => (l.absent ? "AB" : l.obtained != null ? l.obtained : "—");

/**
 * Tabulation sheet + publish flow (PRD §6.3). Publishing freezes ResultSnapshot rows, keeps marks
 * locked and queues one result SMS per guardian. Exams must be LOCKED before publishing.
 * Live: one section at a time (GET /api/exams/:id/tabulation); POST /api/exams/:id/publish.
 * Demo: every tabulation is passed in; publishing only shows a toast.
 */
export default function Tabulation({ exams, sections, data = {}, initial = null, initialExam, canPublish, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [examId, setExamId] = useState(initial?.exam.id ?? initialExam ?? exams[0]?.id);
    const [sectionId, setSectionId] = useState(initial?.sectionId ?? sections[0]?.value);
    const [loaded, setLoaded] = useState(initial ? { [`${initial.exam.id}|${initial.sectionId}`]: initial } : {});
    const [confirm, setConfirm] = useState(false);
    const [sendSms, setSendSms] = useState(true);
    const [incomplete, setIncomplete] = useState(null);
    const [busy, setBusy] = useState(false);

    const key = `${examId}|${sectionId}`;
    const t = demo ? data[key] : loaded[key];
    const exam = exams.find((e) => e.id === examId);
    // Live needs LOCKED (review step). The sales demo shows the dialog for any unpublished exam.
    const publishable = canPublish && exam && (demo ? exam.status !== "PUBLISHED" : exam.status === "LOCKED");

    useEffect(() => {
        if (demo || !examId || !sectionId || loaded[key]) return;
        let cancelled = false;
        api(`/api/exams/${examId}/tabulation?sectionId=${sectionId}`).then((r) => {
            if (cancelled) return;
            if (r.ok) setLoaded((m) => ({ ...m, [key]: { ...r.data, sectionId } }));
            else toast(r.error.message, { title: "Could not load the tabulation", tone: "error" });
        });
        return () => {
            cancelled = true;
        };
    }, [demo, key, examId, sectionId, loaded, toast]);

    if (!exams.length) return <p className="p-8 text-center text-ink-soft">No exams in this session yet.</p>;

    async function publish(allowIncomplete = false) {
        if (demo) {
            setConfirm(false);
            return toast(DEMO_SAVED, { title: "Results would be published", tone: "info" });
        }
        setBusy(true);
        const r = await api(`/api/exams/${examId}/publish`, { method: "POST", body: { sendSms, allowIncomplete } });
        setBusy(false);
        if (!r.ok) {
            if (r.status === 409 && r.error.details?.[0]?.message === "INCOMPLETE") return setIncomplete(r.error.message);
            return toast(r.error.message, { title: "Not published", tone: "error" });
        }
        setConfirm(false);
        setIncomplete(null);
        setLoaded({}); // published tabulations now come from the frozen snapshots
        toast(`${r.data.published} results are live in the portal.${r.data.smsQueued ? " Guardian SMS is going out." : ""}`, { title: `${exam.name} published` });
        router.refresh();
    }

    const close = () => {
        setConfirm(false);
        setIncomplete(null);
    };

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
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <button type="button" onClick={() => window.print()} className="btn-ghost min-h-10 text-[14px]">
                        <Printer className="size-4" aria-hidden="true" /> Print
                    </button>
                    {publishable && (
                        <button type="button" onClick={() => setConfirm(true)} className="btn-primary min-h-10 text-[14px]">
                            <Send className="size-4" aria-hidden="true" /> Publish results
                        </button>
                    )}
                    {canPublish && !demo && (exam.status === "MARKS_OPEN" || exam.status === "DRAFT") && (
                        <Link href="/admin/exams" className="text-[13.5px] text-ink-soft hover:text-ink">
                            Lock marks first to publish →
                        </Link>
                    )}
                </div>
            </div>

            {!t ? (
                <p className="flex items-center justify-center gap-2 p-10 text-ink-soft">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Calculating…
                </p>
            ) : (
                <>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-[14px] text-ink-soft">
                        <span>
                            <b className="text-ink">{t.stats.students}</b> students
                        </span>
                        {!t.remarksMode && (
                            <>
                                <span>
                                    <b className="text-ink">{t.stats.passed}</b> passed
                                </span>
                                <span>
                                    <b className="text-ink">{t.stats.aPlus}</b> A+
                                </span>
                            </>
                        )}
                        {t.stats.incomplete > 0 && <span className="font-medium text-[#8a6a00]">{t.stats.incomplete} with marks missing</span>}
                        {t.remarksMode && <span>Early years: the progress report shows teachers&apos; remarks instead of grades</span>}
                        {exam.status === "PUBLISHED" && <span className="font-medium text-brand-deep">Frozen at publish</span>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-[13.5px]">
                            <thead>
                                <tr className="border-y border-line bg-paper/60 text-[11.5px] tracking-wide text-ink-soft uppercase">
                                    <th className="sticky left-0 bg-[#fbfaf6] px-3 py-2.5 font-semibold">Roll</th>
                                    <th className="sticky left-12 bg-[#fbfaf6] px-3 py-2.5 font-semibold">Student</th>
                                    {t.subjects.map((s) => (
                                        <th key={s} className="px-2 py-2.5 text-right font-semibold" title={s}>
                                            {short(s)}
                                        </th>
                                    ))}
                                    <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                                    {!t.remarksMode && (
                                        <>
                                            <th className="px-3 py-2.5 text-right font-semibold">GPA</th>
                                            <th className="px-3 py-2.5 font-semibold">Grade</th>
                                            <th className="px-3 py-2.5 text-right font-semibold">Pos.</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {t.rows.map((r) => (
                                    <tr key={r.enrollmentId ?? r.roll} className="border-b border-line last:border-0 hover:bg-paper/50">
                                        <td className="sticky left-0 bg-white px-3 py-2 font-semibold tabular-nums">{r.roll}</td>
                                        <td className="sticky left-12 bg-white px-3 py-2 whitespace-nowrap">{r.name}</td>
                                        {r.lines.map((l, i) => {
                                            const m = cellOf(l);
                                            const low = typeof m !== "string" && !t.remarksMode && (l.pass != null ? m < l.pass : Number(m) < 33);
                                            return (
                                                <td key={i} className={`px-2 py-2 text-right tabular-nums ${m === "AB" ? "text-coral" : m === "—" ? "text-ink-soft/50" : low ? "font-semibold text-coral" : ""}`} title={l.remarks ?? undefined}>
                                                    {m}
                                                </td>
                                            );
                                        })}
                                        <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.complete ? r.total : "—"}</td>
                                        {!t.remarksMode && (
                                            <>
                                                <td className="px-3 py-2 text-right tabular-nums">{r.complete && r.gpa != null ? r.gpa.toFixed(2) : "—"}</td>
                                                <td className="px-3 py-2">
                                                    {r.complete ? <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${r.failed ? "bg-coral-soft text-[#b4432a]" : r.grade === "A+" ? "bg-brand-soft text-brand-deep" : "bg-sky-soft text-[#1d6f9c]"}`}>{r.grade}</span> : "—"}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">{r.complete ? r.position : "—"}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <Modal
                open={confirm}
                onClose={close}
                title={`Publish ${exam?.name}?`}
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={close}>
                            Cancel
                        </button>
                        <button type="button" disabled={busy} className="btn-primary min-h-10 text-[14px]" onClick={() => publish(Boolean(incomplete))}>
                            {busy ? "Publishing…" : incomplete ? "Publish anyway" : "Publish"}
                        </button>
                    </>
                }
            >
                <ul className="space-y-2.5 text-[14.5px] text-ink">
                    <li>• Every class in this exam is published together and frozen as a snapshot. Later edits to marks will not change it.</li>
                    <li>• Marks stay locked. Only the Super Admin can unpublish (recorded in the audit log).</li>
                    <li>• Guardians see results in the portal.</li>
                </ul>
                <label className="mt-4 flex items-center gap-2.5 text-[14.5px]">
                    <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} className="size-5 accent-[var(--brand)]" />
                    Send one result SMS to each guardian
                </label>
                {incomplete && <p className="mt-4 rounded-xl bg-sun-soft px-3.5 py-3 text-[14px] font-medium text-[#7a5d00]">{incomplete}</p>}
            </Modal>
        </div>
    );
}
