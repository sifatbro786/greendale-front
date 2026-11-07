import "server-only";

import { db, sectionLabel, staffMap, subjectMap } from "./_shared";

/** Future: GET /api/routine?sectionId=  (teacher routine: GET /api/routine?staffId= — a query, not a table) */
export async function getRoutine({ sectionId, staffId }) {
    const slots = db.routineSlots.filter((s) => (sectionId ? s.sectionId === sectionId : s.staffId === staffId));
    return {
        title: sectionId ? sectionLabel(sectionId) : staffMap.get(staffId)?.name,
        days: db.DAYS,
        periods: db.periods,
        cells: slots.map((s) => ({
            day: s.day,
            periodId: s.periodId,
            subject: subjectMap.get(s.subjectId).name,
            teacher: staffMap.get(s.staffId)?.name ?? "—",
            section: sectionLabel(s.sectionId),
            sectionId: s.sectionId,
        })),
    };
}

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Today's classes for a teacher (teacher home). */
export async function teacherToday(staffId, isoDate) {
    const day = DAY_CODES[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
    return db.routineSlots
        .filter((s) => s.staffId === staffId && s.day === day)
        .map((s) => ({ ...s, period: db.periods.find((p) => p.id === s.periodId), subject: subjectMap.get(s.subjectId).name, section: sectionLabel(s.sectionId) }))
        .sort((a, b) => a.period.number - b.period.number);
}
