import "server-only";

import { classMap, db, enrollmentByStudent, gradeFor, invoiceDue, sectionLabel, sectionMap, staffMap, subjectMap } from "./_shared";

const markIndex = new Map(db.marks.map((m) => [`${m.enrollmentId}|${m.examSubjectId}`, m]));

/** Exam status flow (PRD §6.3): DRAFT → MARKS_OPEN → LOCKED → PUBLISHED */
export const EXAM_STATUSES = ["DRAFT", "MARKS_OPEN", "LOCKED", "PUBLISHED"];

/** Future: GET /api/exams?sessionId=current */
export async function listExams() {
    return db.exams.map((e) => {
        const es = db.examSubjects.filter((x) => x.examId === e.id);
        let expected = 0,
            entered = 0;
        for (const x of es) {
            const n = db.enrollments.filter((en) => en.classId === x.classId).length;
            expected += n;
            entered += db.enrollments.filter((en) => en.classId === x.classId && markIndex.has(`${en.id}|${x.id}`)).length;
        }
        return { ...e, subjects: es.length, progress: expected ? Math.round((entered / expected) * 100) : 0 };
    });
}

/**
 * Marks entry grid for one section + subject.
 * Future: GET /api/exams/:examId/marks?sectionId=&subjectId=  ·  PUT same URL (only while MARKS_OPEN; teacher scope by assignment)
 */
export async function getMarksSheet(examId, sectionId, subjectId) {
    const exam = db.exams.find((e) => e.id === examId);
    const es = db.examSubjects.find((x) => x.examId === examId && x.subjectId === subjectId);
    if (!exam || !es) return null;
    const rows = db.enrollments
        .filter((e) => e.sectionId === sectionId)
        .sort((a, b) => a.roll - b.roll)
        .map((e) => {
            const m = markIndex.get(`${e.id}|${es.id}`);
            return { enrollmentId: e.id, roll: e.roll, name: db.students.find((s) => s.id === e.studentId).name, obtained: m?.obtained ?? null, absent: m?.absent ?? false, remarks: null };
        });
    const teacherId = db.assignments.find((a) => a.subjectId === subjectId)?.staffId;
    return {
        exam: { id: exam.id, name: exam.name, status: exam.status },
        sectionId,
        subjectId,
        section: sectionLabel(sectionId),
        subject: subjectMap.get(subjectId).name,
        teacher: staffMap.get(teacherId)?.name ?? "—",
        fullMarks: es.fullMarks,
        passMarks: es.passMarks,
        gradingMode: classMap.get(sectionMap.get(sectionId).classId).gradingMode,
        editable: exam.status === "MARKS_OPEN",
        rows,
    };
}

/** Section + subject pairs for marks entry (teacher: own assignments). Live: GET /api/exams/marks-options */
export async function marksOptions(user) {
    return db.assignments
        .filter((a) => user?.role !== "TEACHER" || a.staffId === user.staffId)
        .map((a) => ({ value: `${a.sectionId}|${a.subjectId}`, label: `${sectionLabel(a.sectionId)} · ${subjectMap.get(a.subjectId).name}`, sectionId: a.sectionId, subjectId: a.subjectId }));
}

/** Exam setup: subjects grouped by class. Live: GET /api/exams/:id */
export async function getExam(id) {
    const exam = db.exams.find((e) => e.id === id);
    if (!exam) return null;
    const classes = db.classes
        .map((c) => ({
            classId: c.id,
            name: c.name,
            gradingMode: c.gradingMode,
            subjects: db.examSubjects
                .filter((x) => x.examId === id && x.classId === c.id)
                .map((x) => ({ examSubjectId: x.id, subjectId: x.subjectId, name: subjectMap.get(x.subjectId).name, fullMarks: x.fullMarks, passMarks: x.passMarks, examDate: null, startTime: null, hasMarks: db.marks.some((m) => m.examSubjectId === x.id) })),
        }))
        .filter((c) => c.subjects.length);
    return { ...exam, shortName: exam.short, classes };
}

/** Result for one enrollment in one exam (same calculation the worker job will run). */
function computeResult(exam, enrollment) {
    const subs = db.examSubjects.filter((x) => x.examId === exam.id && x.classId === enrollment.classId);
    const cls = classMap.get(enrollment.classId);
    const lines = subs.map((x) => {
        const m = markIndex.get(`${enrollment.id}|${x.id}`);
        const pct = m?.obtained != null ? (m.obtained / x.fullMarks) * 100 : 0;
        const g = gradeFor(pct);
        return { subject: subjectMap.get(x.subjectId).name, full: x.fullMarks, obtained: m?.obtained ?? null, absent: m?.absent ?? false, entered: Boolean(m), grade: m ? (m.absent ? "AB" : g.grade) : "—", point: m && !m.absent ? g.point : 0 };
    });
    const complete = lines.every((l) => l.entered);
    const total = lines.reduce((s, l) => s + (l.obtained ?? 0), 0);
    const failed = lines.some((l) => l.absent || l.point === 0);
    const gpa = failed ? 0 : Math.round((lines.reduce((s, l) => s + l.point, 0) / lines.length) * 100) / 100;
    const overall = failed ? "F" : db.gradeScale.find((g) => gpa >= g.point)?.grade ?? "F";
    return { lines, total, fullTotal: lines.reduce((s, l) => s + l.full, 0), gpa, grade: overall, failed, complete, remarksMode: cls.gradingMode === "REMARKS" };
}

/**
 * Tabulation sheet for a section. Positions: total desc, then roll (tie-break configured per school).
 * Future: GET /api/exams/:examId/tabulation?sectionId=  (published exams read ResultSnapshot)
 */
export async function getTabulation(examId, sectionId) {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return null;
    const ens = db.enrollments.filter((e) => e.sectionId === sectionId);
    const rows = ens
        .map((e) => ({ enrollmentId: e.id, studentId: e.studentId, roll: e.roll, name: db.students.find((s) => s.id === e.studentId).name, ...computeResult(exam, e) }))
        .sort((a, b) => b.total - a.total || a.roll - b.roll)
        .map((r, i) => ({ ...r, position: i + 1 }))
        .sort((a, b) => a.roll - b.roll);
    const subjectsList = db.examSubjects.filter((x) => x.examId === examId && x.classId === ens[0]?.classId).map((x) => subjectMap.get(x.subjectId).name);
    return {
        exam,
        section: sectionLabel(sectionId),
        subjects: subjectsList,
        remarksMode: rows[0]?.remarksMode ?? false,
        rows,
        stats: {
            students: rows.length,
            passed: rows.filter((r) => !r.failed && r.complete).length,
            aPlus: rows.filter((r) => r.grade === "A+").length,
            incomplete: rows.filter((r) => !r.complete).length,
        },
    };
}

/** Portal: published results only. Future: GET /api/portal/results */
export async function studentResults(studentId) {
    const en = enrollmentByStudent.get(studentId);
    return db.exams
        .filter((e) => e.status === "PUBLISHED")
        .map((e) => {
            const tab = db.enrollments.filter((x) => x.sectionId === en.sectionId).map((x) => ({ id: x.id, total: computeResult(e, x).total, roll: x.roll }));
            tab.sort((a, b) => b.total - a.total || a.roll - b.roll);
            const r = computeResult(e, en);
            return { exam: { id: e.id, name: e.name, publishedAt: e.publishedAt }, ...r, position: tab.findIndex((x) => x.id === en.id) + 1, outOf: tab.length };
        });
}

/** Portal marksheet. Returns null for unpublished exams (guardian must not see drafts). */
export async function studentMarksheet(studentId, examId) {
    const all = await studentResults(studentId);
    return all.find((r) => r.exam.id === examId) ?? null;
}

/** Upcoming exam for dashboards. */
export async function upcomingExams() {
    return db.exams.filter((e) => e.status !== "PUBLISHED").map((e) => ({ id: e.id, name: e.name, startDate: e.startDate, status: e.status }));
}

/** Admit card (live: GET /api/exams/students/:id/admit-card). Demo holds above ৳ 3,000 like the default setting. */
export async function admitCard(studentId) {
    const en = enrollmentByStudent.get(studentId);
    const due = db.invoices.filter((i) => i.studentId === studentId).reduce((a, i) => a + invoiceDue(i), 0);
    const exam = (await upcomingExams())[0] ?? null;
    const schedule = exam ? db.examSubjects.filter((x) => x.examId === exam.id && x.classId === en?.classId).map((x) => ({ subject: subjectMap.get(x.subjectId).name, date: null, time: null, fullMarks: x.fullMarks })) : [];
    return { exam, schedule, due, held: due > 3000, holdAbove: 3000 };
}
