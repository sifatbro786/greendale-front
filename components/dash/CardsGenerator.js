"use client";

import { Printer, UserRound } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

/**
 * Admit & ID card generator (PRD §6.6). Preview here; Phase 2 renders the same template to PDF in the worker
 * (2 or 4 cards per A4, CR80 ID cards on A4) via POST /api/cards { type, sectionId, examId, skipDueOver }.
 */
export default function CardsGenerator({ sections, exams, students, school }) {
    const [type, setType] = useState("admit");
    const [sectionId, setSectionId] = useState(sections[0].value);
    const [examId, setExamId] = useState(exams[0]?.id);
    const [skipDues, setSkipDues] = useState(false);
    const [limit, setLimit] = useState(3000);
    const exam = exams.find((e) => e.id === examId);

    const list = useMemo(() => students.filter((s) => s.sectionId === sectionId), [students, sectionId]);
    const held = skipDues ? list.filter((s) => s.due > limit) : [];
    const cards = list.filter((s) => !held.includes(s));

    const field = "mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-[14.5px]";

    return (
        <div>
            <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-4 print:hidden">
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Card type</span>
                    <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
                        <option value="admit">Admit card</option>
                        <option value="id">Student ID card</option>
                    </select>
                </label>
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Class</span>
                    <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className={field}>
                        {sections.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </label>
                {type === "admit" && (
                    <label>
                        <span className="text-[13px] font-medium text-ink-soft">Exam</span>
                        <select value={examId} onChange={(e) => setExamId(e.target.value)} className={field}>
                            {exams.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <div className="flex items-end">
                    <button type="button" onClick={() => window.print()} className="btn-primary min-h-10 w-full text-[14px]">
                        <Printer className="size-4" aria-hidden="true" /> Print {cards.length} cards
                    </button>
                </div>
                {type === "admit" && (
                    <label className="flex flex-wrap items-center gap-2 text-[14px] md:col-span-4">
                        <input type="checkbox" checked={skipDues} onChange={(e) => setSkipDues(e.target.checked)} className="size-4 accent-[var(--brand)]" />
                        Hold admit cards for students with dues above
                        <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 0)} className="h-9 w-28 rounded-lg border border-line px-2 tabular-nums" aria-label="Due limit in taka" />
                        taka
                        {skipDues && <span className="text-[#8a6a00]">· {held.length} held: {held.map((h) => `Roll ${h.roll}`).join(", ") || "none"}</span>}
                    </label>
                )}
            </div>

            <div className={`mt-4 grid gap-4 print:mt-0 print:gap-3 ${type === "admit" ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
                {cards.map((s) =>
                    type === "admit" ? (
                        <article key={s.id} className="break-inside-avoid rounded-2xl border-2 border-brand/70 bg-white p-5">
                            <header className="flex items-center gap-3 border-b border-dashed border-line pb-3">
                                <Image src={school.crest} alt="" width={school.w} height={school.h} className="h-12 w-auto" />
                                <div className="min-w-0 flex-1 leading-tight">
                                    <p className="font-bold tracking-wide text-brand-deep">GREENDALE ENGLISH VERSION SCHOOL</p>
                                    <p className="text-[12px] text-ink-soft">{school.address} · EIIN {school.eiin}</p>
                                </div>
                            </header>
                            <p className="mt-3 text-center text-[13px] font-bold tracking-[0.2em] text-ink uppercase">Admit card · {exam?.name}</p>
                            <div className="mt-3 flex gap-4">
                                <div className="grid h-24 w-20 shrink-0 place-items-center rounded-lg border border-line bg-paper text-ink-soft">
                                    <UserRound className="size-8" aria-hidden="true" />
                                </div>
                                <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                                    <dt className="text-ink-soft">Name</dt>
                                    <dd className="font-semibold">{s.name}</dd>
                                    <dt className="text-ink-soft">Class</dt>
                                    <dd className="font-semibold">{s.section}</dd>
                                    <dt className="text-ink-soft">Roll</dt>
                                    <dd className="font-semibold">{s.roll}</dd>
                                    <dt className="text-ink-soft">Student ID</dt>
                                    <dd className="font-semibold">{s.studentUid}</dd>
                                </dl>
                            </div>
                            <footer className="mt-6 flex justify-between text-[11.5px] text-ink-soft">
                                <span className="border-t border-ink/30 pt-1">Class teacher</span>
                                <span className="border-t border-ink/30 pt-1">Principal</span>
                            </footer>
                        </article>
                    ) : (
                        <article key={s.id} className="aspect-[85.6/54] break-inside-avoid overflow-hidden rounded-2xl border border-line bg-white">
                            <div className="flex h-full">
                                <div className="flex w-[34%] flex-col items-center justify-center gap-2 bg-brand p-3 text-white">
                                    <Image src={school.crest} alt="" width={school.w} height={school.h} className="h-10 w-auto rounded bg-white p-0.5" />
                                    <div className="grid aspect-[3/4] w-full place-items-center rounded-lg bg-white/15">
                                        <UserRound className="size-8 text-white/80" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-3.5">
                                    <div>
                                        <p className="text-[10.5px] font-bold tracking-wider text-brand-deep">GREENDALE ENGLISH VERSION SCHOOL</p>
                                        <p className="mt-1.5 text-[15px] leading-tight font-semibold text-ink">{s.name}</p>
                                        <p className="text-[12px] text-ink-soft">
                                            {s.section} · Roll {s.roll}
                                        </p>
                                    </div>
                                    <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-[11px]">
                                        <dt className="text-ink-soft">ID</dt>
                                        <dd className="font-semibold">{s.studentUid}</dd>
                                        <dt className="text-ink-soft">Blood</dt>
                                        <dd className="font-semibold">{s.bloodGroup}</dd>
                                        <dt className="text-ink-soft">Guardian</dt>
                                        <dd className="font-semibold">{s.guardianPhone}</dd>
                                        <dt className="text-ink-soft">Valid till</dt>
                                        <dd className="font-semibold">31 Dec 2026</dd>
                                    </dl>
                                </div>
                            </div>
                        </article>
                    ),
                )}
            </div>
        </div>
    );
}
