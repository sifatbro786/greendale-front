"use client";

import { useState } from "react";

import DataTable from "./DataTable";

/** Monthly attendance per student, switchable by class. Phase 2: GET /api/attendance/report?sectionId=&month= */
export default function AttendanceReport({ sections, reports, monthLabel }) {
    const [sectionId, setSectionId] = useState(sections[0].value);
    const rep = reports[sectionId];
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                    <h2 className="text-[16px] font-semibold text-ink">Monthly report · {monthLabel}</h2>
                    <p className="text-[13.5px] text-ink-soft">{rep.days} school days so far</p>
                </div>
                <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-[14.5px]">
                    {sections.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>
            <DataTable
                key={sectionId}
                rows={rep.rows.map((r) => ({ ...r, id: r.roll }))}
                columns={[
                    { key: "roll", label: "Roll", type: "number" },
                    { key: "name", label: "Student" },
                    { key: "present", label: "Present", type: "number" },
                    { key: "late", label: "Late", type: "number" },
                    { key: "absent", label: "Absent", type: "number" },
                    { key: "rate", label: "Rate %", type: "number" },
                ]}
                searchKeys={["name"]}
                exportName={`attendance-${sectionId}-${monthLabel.replace(" ", "-")}`}
                pageSize={30}
            />
        </div>
    );
}
