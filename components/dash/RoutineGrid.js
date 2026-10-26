"use client";

import { Printer } from "lucide-react";
import { useState } from "react";

const DAY = { SUN: "Sunday", MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday" };
const TONES = ["bg-brand-soft", "bg-sky-soft", "bg-sun-soft", "bg-coral-soft", "bg-[#EEE9FB]", "bg-[#E6F5F3]", "bg-[#F6EBDD]", "bg-[#EDF3E0]"];

/** Weekly routine grid (print-friendly). Options switch between class routines (or a teacher's). */
export default function RoutineGrid({ options, routines, showTeacher = true }) {
    const [id, setId] = useState(options[0].value);
    const r = routines[id];
    const subjects = [...new Set(r.cells.map((c) => c.subject))];
    const tone = (s) => TONES[subjects.indexOf(s) % TONES.length];

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 print:hidden">
                {options.length > 1 && (
                    <select value={id} onChange={(e) => setId(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-[14.5px]">
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                )}
                <p className="text-[14px] text-ink-soft">{r.title}</p>
                <button type="button" onClick={() => window.print()} className="btn-ghost ml-auto min-h-10 text-[14px]">
                    <Printer className="size-4" aria-hidden="true" /> Print
                </button>
            </div>
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
                                    return (
                                        <td key={p.id} className={`h-16 rounded-xl px-3 py-2 align-top ${c ? tone(c.subject) : "bg-paper"}`}>
                                            {c ? (
                                                <>
                                                    <span className="block font-semibold text-ink">{c.subject}</span>
                                                    <span className="block text-[12px] text-ink-soft">{showTeacher ? c.teacher : c.section}</span>
                                                </>
                                            ) : (
                                                <span className="text-[12px] text-ink-soft/70">Activity / library</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="mt-3 text-[12.5px] text-ink-soft">Tiffin break 10:00–10:20. A teacher can never be booked in two classes in the same period (database rule).</p>
            </div>
        </div>
    );
}
