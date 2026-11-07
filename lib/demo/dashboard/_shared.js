import "server-only";

import * as db from "@/lib/demo/seed";

/**
 * Shared lookups for the dashboard data layer. Phase 2 deletes this file: every exported function in
 * lib/dashboard/* becomes a fetch() to the Express API with the same return shape.
 */
export { db };

export const byId = (list) => new Map(list.map((x) => [x.id, x]));
export const classMap = byId(db.classes);
export const sectionMap = byId(db.sections);
export const staffMap = byId(db.staff);
export const studentMap = byId(db.students);
export const subjectMap = byId(db.subjects);
export const enrollmentByStudent = new Map(db.enrollments.map((e) => [e.studentId, e]));
export const feeHeadMap = byId(db.feeHeads);

export const TODAY = db.DEMO_TODAY;

/** Class label like "Class III (A)". */
export function sectionLabel(sectionId) {
    const sec = sectionMap.get(sectionId);
    if (!sec) return "";
    return `${classMap.get(sec.classId).name} (${sec.name})`;
}

/* ---------------- dates (Asia/Dhaka, DATE strings only — PRD §6.4) ---------------- */
export function addDays(iso, n) {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
export const weekday = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat
const holidaySet = new Set(db.holidays.map((h) => h.date));
/** Bangladesh school week: Friday and Saturday are off. */
export const isSchoolDay = (iso) => ![5, 6].includes(weekday(iso)) && !holidaySet.has(iso);

export function schoolDaysBetween(from, to) {
    const out = [];
    for (let d = from; d <= to; d = addDays(d, 1)) if (isSchoolDay(d)) out.push(d);
    return out;
}

export function lastSchoolDays(n, until = TODAY) {
    const out = [];
    let d = until;
    while (out.length < n) {
        if (isSchoolDay(d)) out.unshift(d);
        d = addDays(d, -1);
    }
    return out;
}

/* ---------------- attendance generator ---------------- */
/** Sections whose attendance for TODAY is not taken yet (shows the "pending" state in the demo). */
export const PENDING_TODAY = new Set(["c4-a"]);

/** @returns {"PRESENT"|"ABSENT"|"LATE"|null} null = not taken */
export function attendanceStatus(enrollment, date) {
    if (date > TODAY || !isSchoolDay(date)) return null;
    if (date === TODAY && PENDING_TODAY.has(enrollment.sectionId)) return null;
    const r = db.hash(`att-${enrollment.id}-${date}`);
    const weak = db.hash(`weak-${enrollment.studentId}`) < 0.12 ? 0.06 : 0; // a few students miss more often
    if (r < 0.035 + weak) return "ABSENT";
    if (r < 0.06 + weak) return "LATE";
    return "PRESENT";
}

/* ---------------- grading ---------------- */
export function gradeFor(percent) {
    return db.gradeScale.find((g) => percent >= g.minPercent && percent <= g.maxPercent) ?? db.gradeScale.at(-1);
}

/* ---------------- money ---------------- */
/** Allocated amount per invoice (non-reversed payments only). */
export const paidByInvoice = (() => {
    const reversed = new Set(db.payments.filter((p) => p.status === "REVERSED").map((p) => p.id));
    const m = new Map();
    for (const a of db.allocations) {
        if (reversed.has(a.paymentId)) continue;
        m.set(a.invoiceId, (m.get(a.invoiceId) ?? 0) + a.amount);
    }
    return m;
})();

export function invoiceDue(inv) {
    return Math.max(0, inv.amount - inv.discount - (paidByInvoice.get(inv.id) ?? 0));
}
