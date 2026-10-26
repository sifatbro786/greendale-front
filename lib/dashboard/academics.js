import "server-only";

import { classMap, db, sectionLabel, staffMap, subjectMap } from "./_shared";

/**
 * @typedef {{ id: string, name: string, order: number, gradingMode: "MARKS"|"REMARKS", sections: { id: string, name: string, classTeacher: string|null, students: number }[], subjects: string[] }} ClassRow
 */

/** Future: GET /api/classes?sessionId=current  @returns {Promise<ClassRow[]>} */
export async function listClasses() {
    return db.classes.map((c) => ({
        id: c.id,
        name: c.name,
        order: c.order,
        gradingMode: c.gradingMode,
        sections: db.sections
            .filter((s) => s.classId === c.id)
            .map((s) => ({
                id: s.id,
                name: s.name,
                classTeacher: staffMap.get(s.classTeacherId)?.name ?? null,
                students: db.enrollments.filter((e) => e.sectionId === s.id).length,
            })),
        subjects: db.subjects.filter((s) => s.classId === c.id).map((s) => s.name),
    }));
}

/** Future: GET /api/sections (for selects) */
export async function listSectionOptions() {
    return db.sections.map((s) => ({ value: s.id, label: sectionLabel(s.id), classId: s.classId }));
}

/** Future: GET /api/sessions */
export async function listSessions() {
    return [db.session, { id: "ses-2025", name: "2025", startDate: "2025-01-01", endDate: "2025-12-31", isCurrent: false }];
}

/** Future: GET /api/staff */
export async function listStaff() {
    return db.staff.map((t) => ({
        ...t,
        classTeacherOf: db.sections.filter((s) => s.classTeacherId === t.id).map((s) => sectionLabel(s.id)),
        subjects: db.assignments
            .filter((a) => a.staffId === t.id)
            .map((a) => `${subjectMap.get(a.subjectId).name} · ${classMap.get(subjectMap.get(a.subjectId).classId).name}`),
    }));
}

/** Future: GET /api/grade-scale */
export async function getGradeScale() {
    return db.gradeScale;
}

/** Sections and subjects a teacher is assigned to (teacher "own" scope). Future: GET /api/me/assignments */
export async function teacherAssignments(staffId) {
    return db.assignments
        .filter((a) => a.staffId === staffId)
        .map((a) => ({
            sectionId: a.sectionId,
            subjectId: a.subjectId,
            label: `${sectionLabel(a.sectionId)} · ${subjectMap.get(a.subjectId).name}`,
        }));
}

/** Sections where the teacher is class teacher OR teaches a subject. */
export async function teacherSections(staffId) {
    const ids = new Set(db.assignments.filter((a) => a.staffId === staffId).map((a) => a.sectionId));
    db.sections.filter((s) => s.classTeacherId === staffId).forEach((s) => ids.add(s.id));
    return [...ids].map((id) => ({ value: id, label: sectionLabel(id), isClassTeacher: db.sections.find((s) => s.id === id).classTeacherId === staffId }));
}
