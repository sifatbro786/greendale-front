import "server-only";

import { attendanceStatus, db, enrollmentByStudent, isSchoolDay, lastSchoolDays, PENDING_TODAY, schoolDaysBetween, sectionLabel, TODAY } from "./_shared";

export { TODAY };

/**
 * Future: GET /api/attendance?sectionId=&date=YYYY-MM-DD
 * Saving: PUT /api/attendance { sectionId, date, entries[{enrollmentId,status}] } — upsert, unique per enrollment+date.
 */
export async function getAttendanceSheet(sectionId, date = TODAY) {
    const rows = db.enrollments
        .filter((e) => e.sectionId === sectionId)
        .sort((a, b) => a.roll - b.roll)
        .map((e) => {
            const s = db.students.find((x) => x.id === e.studentId);
            return { enrollmentId: e.id, studentId: s.id, name: s.name, roll: e.roll, gender: s.gender, guardianPhone: s.guardianPhone, status: attendanceStatus(e, date) };
        });
    return {
        sectionId,
        section: sectionLabel(sectionId),
        date,
        isSchoolDay: isSchoolDay(date),
        holiday: db.holidays.find((h) => h.date === date)?.title ?? null,
        taken: rows.some((r) => r.status),
        smsCutoff: "10:30",
        rows,
    };
}

/** Per-section summary for a date. Future: GET /api/attendance/summary?date= */
export async function attendanceSummary(date = TODAY) {
    const sections = db.sections.map((sec) => {
        const ens = db.enrollments.filter((e) => e.sectionId === sec.id);
        const st = ens.map((e) => attendanceStatus(e, date));
        const taken = st.some(Boolean);
        return {
            sectionId: sec.id,
            section: sectionLabel(sec.id),
            total: ens.length,
            present: st.filter((x) => x === "PRESENT").length,
            late: st.filter((x) => x === "LATE").length,
            absent: st.filter((x) => x === "ABSENT").length,
            taken,
        };
    });
    const taken = sections.filter((s) => s.taken);
    const total = taken.reduce((a, s) => a + s.total, 0);
    const here = taken.reduce((a, s) => a + s.present + s.late, 0);
    return { date, sections, rate: total ? Math.round((here / total) * 1000) / 10 : null, pending: sections.filter((s) => !s.taken).map((s) => s.section) };
}

/** Daily attendance % for the last n school days. Future: GET /api/attendance/trend?days= */
export async function attendanceTrend(n = 14) {
    return lastSchoolDays(n).map((date) => {
        let total = 0,
            here = 0;
        for (const e of db.enrollments) {
            const st = attendanceStatus(e, date);
            if (!st) continue;
            total++;
            if (st !== "ABSENT") here++;
        }
        return { date, rate: total ? Math.round((here / total) * 1000) / 10 : null };
    });
}

/** Monthly calendar for one student (portal). Future: GET /api/portal/attendance?month=YYYY-MM */
export async function studentAttendanceMonth(studentId, month) {
    const en = enrollmentByStudent.get(studentId);
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const date = `${month}-${String(i + 1).padStart(2, "0")}`;
        const holiday = db.holidays.find((h) => h.date === date)?.title ?? null;
        return { date, status: attendanceStatus(en, date), schoolDay: isSchoolDay(date), holiday, future: date > TODAY };
    });
    const counted = days.filter((d) => d.status);
    return {
        month,
        days,
        present: counted.filter((d) => d.status === "PRESENT").length,
        late: counted.filter((d) => d.status === "LATE").length,
        absent: counted.filter((d) => d.status === "ABSENT").length,
        workingDays: days.filter((d) => d.schoolDay && !d.future).length,
    };
}

/** Monthly summary per student for a section (report). Future: GET /api/attendance/report?sectionId=&month= */
export async function monthlyReport(sectionId, month) {
    const [y, m] = month.split("-").map(Number);
    const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    const days = schoolDaysBetween(`${month}-01`, last < TODAY ? last : TODAY);
    return {
        days: days.length,
        rows: db.enrollments
            .filter((e) => e.sectionId === sectionId)
            .sort((a, b) => a.roll - b.roll)
            .map((e) => {
                const st = days.map((d) => attendanceStatus(e, d));
                const p = st.filter((x) => x === "PRESENT").length,
                    l = st.filter((x) => x === "LATE").length,
                    a = st.filter((x) => x === "ABSENT").length;
                const t = p + l + a;
                return { roll: e.roll, name: db.students.find((s) => s.id === e.studentId).name, present: p, late: l, absent: a, rate: t ? Math.round(((p + l) / t) * 100) : 0 };
            }),
    };
}

export const PENDING_SECTIONS = PENDING_TODAY;
