import "server-only";

import { attendanceStatus, classMap, db, enrollmentByStudent, invoiceDue, schoolDaysBetween, sectionLabel, TODAY } from "./_shared";

/**
 * @typedef {Object} StudentRow
 * @property {string} id
 * @property {string} studentUid
 * @property {string} name
 * @property {"MALE"|"FEMALE"} gender
 * @property {string} classId
 * @property {string} className
 * @property {string} sectionId
 * @property {string} section       e.g. "Class III (A)"
 * @property {number} roll
 * @property {string} fatherName
 * @property {string} guardianPhone
 * @property {"ACTIVE"|"INACTIVE"} status
 * @property {number} due            integer taka
 */

function dueFor(studentId) {
    return db.invoices.filter((i) => i.studentId === studentId).reduce((s, i) => s + invoiceDue(i), 0);
}

/**
 * Future: GET /api/students?sessionId=current&sectionIds=…  (teacher scope enforced by the API)
 * @param {{ sectionIds?: string[] }} [opts]
 * @returns {Promise<StudentRow[]>}
 */
export async function listStudents({ sectionIds } = {}) {
    return db.students
        .map((s) => {
            const en = enrollmentByStudent.get(s.id);
            return {
                id: s.id,
                studentUid: s.studentUid,
                name: s.name,
                gender: s.gender,
                classId: en.classId,
                className: classMap.get(en.classId).name,
                classOrder: classMap.get(en.classId).order,
                sectionId: en.sectionId,
                section: sectionLabel(en.sectionId),
                roll: en.roll,
                fatherName: s.fatherName,
                guardianPhone: s.guardianPhone,
                status: s.status,
                due: dueFor(s.id),
            };
        })
        .filter((r) => !sectionIds || sectionIds.includes(r.sectionId))
        .sort((a, b) => a.classOrder - b.classOrder || a.roll - b.roll);
}

/** Future: GET /api/students/:id — returns 404 for ids outside the caller's scope. */
export async function getStudent(id) {
    const s = db.students.find((x) => x.id === id);
    if (!s) return null;
    const en = enrollmentByStudent.get(s.id);
    const days = schoolDaysBetween("2026-01-01", TODAY);
    let present = 0,
        absent = 0,
        late = 0;
    for (const d of days) {
        const st = attendanceStatus(en, d);
        if (st === "PRESENT") present++;
        else if (st === "ABSENT") absent++;
        else if (st === "LATE") late++;
    }
    const taken = present + absent + late;
    return {
        ...s,
        classId: en.classId,
        className: classMap.get(en.classId).name,
        sectionId: en.sectionId,
        section: sectionLabel(en.sectionId),
        roll: en.roll,
        enrollmentId: en.id,
        attendance: { present, absent, late, rate: taken ? Math.round(((present + late) / taken) * 1000) / 10 : 0 },
        due: dueFor(s.id),
        history: [
            { session: "2026", section: sectionLabel(en.sectionId), roll: en.roll },
            ...(s.admissionDate.startsWith("2025") && classMap.get(en.classId).order > 1
                ? [{ session: "2025", section: `${db.classes.find((c) => c.order === classMap.get(en.classId).order - 1).name} (A)`, roll: en.roll }]
                : []),
        ],
    };
}

/** Counts for the dashboard. Future: GET /api/dashboard/summary */
export async function studentCounts() {
    const active = db.students.filter((s) => s.status === "ACTIVE");
    return {
        total: active.length,
        boys: active.filter((s) => s.gender === "MALE").length,
        girls: active.filter((s) => s.gender === "FEMALE").length,
        newThisYear: active.filter((s) => s.admissionDate.startsWith("2026")).length,
        byClass: db.classes.map((c) => ({ label: c.name, value: db.enrollments.filter((e) => e.classId === c.id).length })),
    };
}
