"use client";

import { CheckCheck, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DEMO_SAVED, useToast } from "./Toast";

const NEXT = { PRESENT: "ABSENT", ABSENT: "LATE", LATE: "PRESENT" };
const STYLE = {
    PRESENT: "border-brand/30 bg-brand-soft text-brand-deep",
    ABSENT: "border-coral/40 bg-coral-soft text-[#b4432a]",
    LATE: "border-sun bg-sun-soft text-[#7a5d00]",
};
const LABEL = { PRESENT: "Present", ABSENT: "Absent", LATE: "Late" };

/**
 * Mobile-first attendance (PRD §6.4): everyone starts Present, tap a student to cycle Absent → Late → Present.
 * Phase 2: PUT /api/attendance { sectionId, date, entries } (upsert; unique per enrollment+date).
 * @param {{ sections: {value:string,label:string}[], dates: string[], sheets: Record<string, any>, today: string, cutoff: string }} props
 */
export default function AttendanceTaker({ sections, dates, sheets, today, cutoff }) {
    const params = useSearchParams();
    const initialSection = sections.some((s) => s.value === params.get("section")) ? params.get("section") : sections[0]?.value;
    const [sectionId, setSectionId] = useState(initialSection);
    const [date, setDate] = useState(today);
    const [overrides, setOverrides] = useState({});
    const toast = useToast();

    const sheet = sheets[`${sectionId}|${date}`];
    const key = `${sectionId}|${date}`;
    const rows = useMemo(() => (sheet?.rows ?? []).map((r) => ({ ...r, status: overrides[key]?.[r.enrollmentId] ?? r.status ?? "PRESENT" })), [sheet, overrides, key]);

    const counts = rows.reduce((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
    const set = (id, status) => setOverrides((o) => ({ ...o, [key]: { ...(o[key] ?? {}), [id]: status } }));
    const allPresent = () => setOverrides((o) => ({ ...o, [key]: Object.fromEntries(rows.map((r) => [r.enrollmentId, "PRESENT"])) }));

    function save() {
        const absent = counts.ABSENT ?? 0;
        toast(date === today && absent ? `Absent SMS would go to ${absent} guardian${absent > 1 ? "s" : ""} at ${cutoff} (only if still absent then). ${DEMO_SAVED}` : DEMO_SAVED, { title: `Attendance for ${sheet.section} saved`, tone: "info" });
    }

    const dateLabel = (d) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", weekday: "short", day: "numeric", month: "short" }).format(new Date(d));

    return (
        <div className="pb-24 sm:pb-0">
            <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Class</span>
                    <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none focus:border-brand">
                        {sections.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span className="text-[13px] font-medium text-ink-soft">Date</span>
                    <select value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none focus:border-brand">
                        {dates.map((d) => (
                            <option key={d} value={d}>
                                {d === today ? `Today · ${dateLabel(d)}` : dateLabel(d)}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="button" onClick={allPresent} className="btn-ghost min-h-11 text-[14px]">
                    <CheckCheck className="size-4" aria-hidden="true" /> All present
                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px]">
                <span className="rounded-full bg-brand-soft px-3 py-1 font-medium text-brand-deep">{counts.PRESENT ?? 0} present</span>
                <span className="rounded-full bg-coral-soft px-3 py-1 font-medium text-[#b4432a]">{counts.ABSENT ?? 0} absent</span>
                <span className="rounded-full bg-sun-soft px-3 py-1 font-medium text-[#7a5d00]">{counts.LATE ?? 0} late</span>
                <span className="text-ink-soft">
                    · {rows.length} students · {sheet?.taken ? "already submitted, you can correct it" : "not submitted yet"}
                </span>
            </div>

            <p className="mt-2 text-[13.5px] text-ink-soft">Tap a student to mark Absent, tap again for Late. Absent SMS goes once at {cutoff}, so corrections before then send nothing.</p>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((r) => (
                    <li key={r.enrollmentId}>
                        <button
                            type="button"
                            onClick={() => set(r.enrollmentId, NEXT[r.status])}
                            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${STYLE[r.status]}`}
                            aria-label={`${r.name}, roll ${r.roll}: ${LABEL[r.status]}. Tap to change.`}
                        >
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-[14px] font-bold text-ink tabular-nums">{r.roll}</span>
                            <span className="min-w-0 flex-1 truncate font-medium text-ink">{r.name}</span>
                            <span className="text-[13px] font-semibold">{LABEL[r.status]}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 p-3 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
                <button type="button" onClick={save} className="btn-primary w-full sm:w-auto">
                    <Save className="size-4" aria-hidden="true" /> Save attendance
                </button>
            </div>
        </div>
    );
}
